-- Follow-up migration: works whether the invitation migration was already
-- deployed or both migrations are being applied together for the first time.
BEGIN;

DROP TRIGGER IF EXISTS link_invited_tutor ON auth.users;
REVOKE ALL ON FUNCTION public.reserve_tutor_invitation(uuid) FROM service_role;

CREATE FUNCTION public.prepare_tutor_account(target_tutor_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  tutor public."Tutor";
  account_email text;
BEGIN
  SELECT * INTO tutor FROM public."Tutor" WHERE tutor_id = target_tutor_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tutor not found.'; END IF;
  IF tutor.auth_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'This tutor already has an account. Use Reset password if they need a new temporary password.';
  END IF;
  account_email := lower(btrim(tutor.email));
  IF account_email IS NULL OR account_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Add a valid email address to this tutor before creating their account.';
  END IF;
  IF EXISTS (SELECT 1 FROM public."Tutor" t WHERE lower(btrim(t.email)) = account_email AND t.tutor_id <> target_tutor_id) THEN
    RAISE EXCEPTION 'Another tutor has this email address. Give each tutor a unique email.';
  END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = account_email) THEN
    RAISE EXCEPTION 'This email already has an account. An administrator must review and link it separately.';
  END IF;
  RETURN account_email;
END
$$;
REVOKE ALL ON FUNCTION public.prepare_tutor_account(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_tutor_account(uuid) TO service_role;

-- app_metadata can only be assigned through trusted admin operations. Unlike
-- user_metadata, it cannot be supplied/changed through public signup or profile APIs.
CREATE FUNCTION private.link_created_tutor() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_id uuid;
BEGIN
  IF NEW.raw_app_meta_data ->> 'role' IS DISTINCT FROM 'tutor'
    OR NEW.raw_app_meta_data ->> 'tutor_id' IS NULL THEN RETURN NEW; END IF;
  target_id := (NEW.raw_app_meta_data ->> 'tutor_id')::uuid;
  UPDATE public."Tutor" SET auth_user_id = NEW.id
    WHERE tutor_id = target_id AND (auth_user_id IS NULL OR auth_user_id = NEW.id)
      AND lower(btrim(email)) = lower(NEW.email);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutor is already linked, missing, or its email has changed.';
  END IF;
  RETURN NEW;
END
$$;
-- GoTrue can insert first and set app_metadata later in the same transaction.
CREATE TRIGGER link_created_tutor AFTER INSERT OR UPDATE OF raw_app_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.link_created_tutor();

COMMIT;
