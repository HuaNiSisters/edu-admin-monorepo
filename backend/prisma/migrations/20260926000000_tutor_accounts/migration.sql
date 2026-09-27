-- Supabase-only migration. Review existing admin/reception app_metadata roles
-- before deploying; user_metadata is deliberately never trusted or copied.
BEGIN;

ALTER TABLE public."Tutor" ADD COLUMN auth_user_id uuid UNIQUE;
ALTER TABLE public."Tutor" ADD CONSTRAINT "Tutor_auth_user_id_fkey"
  FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
CREATE TABLE private.tutor_invitations (
  tutor_id uuid PRIMARY KEY REFERENCES public."Tutor"(tutor_id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  requested_at timestamptz NOT NULL DEFAULT now()
);

-- Read current trusted metadata, so role revocation does not wait for JWT expiry.
CREATE FUNCTION public.current_app_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT raw_app_meta_data ->> 'role' FROM auth.users WHERE id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;

CREATE FUNCTION public.reserve_tutor_invitation(target_tutor_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  tutor public."Tutor";
  invite_email text;
  existing_user auth.users;
  last_request timestamptz;
BEGIN
  SELECT * INTO tutor FROM public."Tutor" WHERE tutor_id = target_tutor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tutor not found.'; END IF;
  invite_email := lower(btrim(tutor.email));
  IF invite_email IS NULL OR invite_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Add a valid email address to this tutor before inviting them.';
  END IF;
  IF EXISTS (SELECT 1 FROM public."Tutor" t WHERE lower(btrim(t.email)) = invite_email AND t.tutor_id <> target_tutor_id) THEN
    RAISE EXCEPTION 'Another tutor has this email address. Give each tutor a unique email.';
  END IF;
  SELECT * INTO existing_user FROM auth.users WHERE lower(email) = invite_email LIMIT 1;
  IF FOUND THEN
    IF tutor.auth_user_id IS DISTINCT FROM existing_user.id THEN
      RAISE EXCEPTION 'This email already has an account. It must be linked by an administrator before inviting.';
    END IF;
    IF existing_user.email_confirmed_at IS NOT NULL THEN
      RAISE EXCEPTION 'This tutor has already accepted. They can request a sign-in link on the login page.';
    END IF;
  ELSIF tutor.auth_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'The tutor email does not match the linked account.';
  END IF;
  SELECT requested_at INTO last_request FROM private.tutor_invitations WHERE tutor_id = target_tutor_id;
  IF last_request > now() - interval '60 seconds' THEN
    RAISE EXCEPTION 'Please wait a minute before sending another invitation.';
  END IF;
  INSERT INTO private.tutor_invitations (tutor_id, email, requested_at)
    VALUES (target_tutor_id, invite_email, now())
    ON CONFLICT (tutor_id) DO UPDATE SET email = EXCLUDED.email, requested_at = EXCLUDED.requested_at;
  RETURN invite_email;
END
$$;
REVOKE ALL ON FUNCTION public.reserve_tutor_invitation(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_tutor_invitation(uuid) TO service_role;

-- GoTrue sets invited_at after creating the user. Link on that transition,
-- inside the Auth transaction, rather than trusting signup user_metadata.
CREATE FUNCTION private.link_invited_tutor() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_id uuid;
BEGIN
  IF NEW.invited_at IS NULL THEN RETURN NEW; END IF;
  SELECT tutor_id INTO target_id FROM private.tutor_invitations
    WHERE email = lower(NEW.email) FOR UPDATE;
  IF target_id IS NULL THEN RETURN NEW; END IF;
  IF coalesce(NEW.raw_app_meta_data ->> 'role', 'tutor') <> 'tutor' THEN
    RAISE EXCEPTION 'Cannot replace an existing staff role with a tutor role.';
  END IF;
  UPDATE public."Tutor" SET auth_user_id = NEW.id
    WHERE tutor_id = target_id AND lower(btrim(email)) = lower(NEW.email)
      AND (auth_user_id IS NULL OR auth_user_id = NEW.id);
  IF NOT FOUND THEN RAISE EXCEPTION 'Tutor invitation no longer matches this account.'; END IF;
  UPDATE auth.users SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"tutor"}'::jsonb
    WHERE id = NEW.id;
  RETURN NEW;
END
$$;
CREATE TRIGGER link_invited_tutor AFTER INSERT OR UPDATE OF invited_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.link_invited_tutor();

-- Prevent direct Auth API email-change requests as well as profile-form edits.
CREATE FUNCTION private.lock_tutor_login_email() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF (NEW.email IS DISTINCT FROM OLD.email OR coalesce(NEW.email_change, '') IS DISTINCT FROM coalesce(OLD.email_change, ''))
    AND EXISTS (SELECT 1 FROM public."Tutor" WHERE auth_user_id = OLD.id) THEN
    RAISE EXCEPTION 'Tutor login email is managed by the administrator.';
  END IF;
  RETURN NEW;
END
$$;
CREATE TRIGGER lock_tutor_login_email BEFORE UPDATE OF email, email_change ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.lock_tutor_login_email();

CREATE FUNCTION public.protect_tutor_account_fields() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id OR NEW.tutor_id IS DISTINCT FROM OLD.tutor_id
      OR (OLD.auth_user_id IS NOT NULL AND NEW.email IS DISTINCT FROM OLD.email)
      OR (public.current_app_role() = 'tutor' AND NEW.email IS DISTINCT FROM OLD.email) THEN
      RAISE EXCEPTION 'Account links and login emails cannot be changed through profile updates.';
    END IF;
    IF length(btrim(NEW.first_name)) NOT BETWEEN 1 AND 100 OR length(btrim(NEW.last_name)) NOT BETWEEN 1 AND 100
      OR length(NEW.phone) > 40 THEN RAISE EXCEPTION 'Invalid profile details.'; END IF;
  END IF;
  RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.protect_tutor_account_fields() FROM PUBLIC;
CREATE TRIGGER protect_tutor_account_fields BEFORE UPDATE ON public."Tutor"
  FOR EACH ROW EXECUTE FUNCTION public.protect_tutor_account_fields();

ALTER TABLE public."Tutor" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."Tutor" FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Tutor" TO authenticated;

-- Restrictive policies also constrain pre-existing permissive policies.
CREATE POLICY tutor_account_boundary ON public."Tutor" AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.current_app_role() IN ('admin', 'reception') OR (public.current_app_role() = 'tutor' AND auth_user_id = auth.uid()))
  WITH CHECK (public.current_app_role() = 'admin' OR (public.current_app_role() = 'tutor' AND auth_user_id = auth.uid()));
CREATE POLICY tutor_read ON public."Tutor" FOR SELECT TO authenticated
  USING (public.current_app_role() IN ('admin', 'reception') OR (public.current_app_role() = 'tutor' AND auth_user_id = auth.uid()));
CREATE POLICY tutor_update ON public."Tutor" FOR UPDATE TO authenticated
  USING (public.current_app_role() = 'admin' OR (public.current_app_role() = 'tutor' AND auth_user_id = auth.uid()));
CREATE POLICY tutor_insert_admin_boundary ON public."Tutor" AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.current_app_role() = 'admin' AND auth_user_id IS NULL);
CREATE POLICY tutor_delete_admin_boundary ON public."Tutor" AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.current_app_role() = 'admin');
CREATE POLICY tutor_admin_insert ON public."Tutor" FOR INSERT TO authenticated WITH CHECK (public.current_app_role() = 'admin');
CREATE POLICY tutor_admin_delete ON public."Tutor" FOR DELETE TO authenticated USING (public.current_app_role() = 'admin');

-- Tutors initially have profile-only access. Keep existing admin/reception data
-- workflows, but deny new tutor accounts direct access to the other app tables.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['Student', 'Parent', 'StudentParent', 'ClassTime', 'SubjectOffering', 'Term', 'Enrolment', 'Attendance', 'Payment'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', table_name);
    EXECUTE format('CREATE POLICY staff_boundary ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (public.current_app_role() IN (''admin'', ''reception'')) WITH CHECK (public.current_app_role() IN (''admin'', ''reception''))', table_name);
    -- Existing RLS policies still determine staff permissions if already present.
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = table_name AND permissive = 'PERMISSIVE') THEN
      EXECUTE format('CREATE POLICY staff_access ON public.%I FOR ALL TO authenticated USING (public.current_app_role() IN (''admin'', ''reception'')) WITH CHECK (public.current_app_role() IN (''admin'', ''reception''))', table_name);
    END IF;
  END LOOP;
END
$$;
COMMIT;
