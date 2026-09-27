-- Separate private employment/payroll data from the tutor directory and class joins.
BEGIN;
CREATE TABLE public."TutorDetails" (
  tutor_id uuid PRIMARY KEY REFERENCES public."Tutor"(tutor_id) ON DELETE CASCADE ON UPDATE CASCADE,
  date_of_birth date,
  gender text CHECK (gender IN ('female', 'male', 'other', 'prefer_not_to_say')),
  address text,
  job text NOT NULL DEFAULT 'Tutor',
  start_date date,
  end_date date,
  emergency_contact_name text,
  emergency_contact_mobile text,
  start_hourly_rate numeric(8,2) CHECK (start_hourly_rate >= 0),
  tfn text,
  account_name text,
  bsb text CHECK (bsb ~ '^[0-9]{6}$'),
  account_number text,
  super_name text,
  super_member_number text,
  high_school text,
  university_course text,
  working_with_children text,
  police_check text,
  special_skills text,
  hsc_subjects text[] NOT NULL DEFAULT '{}'::text[],
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);
ALTER TABLE public."TutorDetails" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."TutorDetails" FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."TutorDetails" TO authenticated;
CREATE POLICY employee_private_details ON public."TutorDetails" FOR ALL TO authenticated
  USING (public.current_app_role() = 'admin' OR (public.current_app_role() = 'tutor' AND EXISTS (
    SELECT 1 FROM public."Tutor" t WHERE t.tutor_id = "TutorDetails".tutor_id AND t.auth_user_id = auth.uid()
  )))
  WITH CHECK (public.current_app_role() = 'admin' OR (public.current_app_role() = 'tutor' AND EXISTS (
    SELECT 1 FROM public."Tutor" t WHERE t.tutor_id = "TutorDetails".tutor_id AND t.auth_user_id = auth.uid()
  )));
CREATE POLICY employee_details_delete_admin ON public."TutorDetails" AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.current_app_role() = 'admin');

CREATE FUNCTION public.protect_employee_employment_fields() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.tutor_id IS DISTINCT FROM OLD.tutor_id THEN
    RAISE EXCEPTION 'An employee details record cannot be reassigned.';
  END IF;
  IF current_user = 'authenticated' AND public.current_app_role() = 'tutor' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.job <> 'Tutor' OR NEW.start_date IS NOT NULL OR NEW.end_date IS NOT NULL OR NEW.start_hourly_rate IS NOT NULL OR NEW.tfn IS NOT NULL OR NEW.account_name IS NOT NULL OR NEW.bsb IS NOT NULL OR NEW.account_number IS NOT NULL OR NEW.super_name IS NOT NULL OR NEW.super_member_number IS NOT NULL THEN
        RAISE EXCEPTION 'Only administrators can change employment and payroll details.';
      END IF;
    ELSE
      IF ROW(NEW.job, NEW.start_date, NEW.end_date, NEW.start_hourly_rate, NEW.tfn, NEW.account_name, NEW.bsb, NEW.account_number, NEW.super_name, NEW.super_member_number)
        IS DISTINCT FROM ROW(OLD.job, OLD.start_date, OLD.end_date, OLD.start_hourly_rate, OLD.tfn, OLD.account_name, OLD.bsb, OLD.account_number, OLD.super_name, OLD.super_member_number) THEN
        RAISE EXCEPTION 'Only administrators can change employment and payroll details.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.protect_employee_employment_fields() FROM PUBLIC;
CREATE TRIGGER protect_employee_employment_fields BEFORE INSERT OR UPDATE ON public."TutorDetails"
  FOR EACH ROW EXECUTE FUNCTION public.protect_employee_employment_fields();

-- Name and email are immutable in every authenticated edit, even before a login
-- account is linked. The service-only account-linking triggers still work.
CREATE OR REPLACE FUNCTION public.protect_tutor_account_fields() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF ROW(NEW.auth_user_id, NEW.tutor_id, NEW.email, NEW.first_name, NEW.last_name)
      IS DISTINCT FROM ROW(OLD.auth_user_id, OLD.tutor_id, OLD.email, OLD.first_name, OLD.last_name) THEN
      RAISE EXCEPTION 'Name, email, and account links cannot be changed after creation.';
    END IF;
    IF length(btrim(NEW.phone)) NOT BETWEEN 1 AND 40 THEN RAISE EXCEPTION 'Enter a mobile number.'; END IF;
  END IF;
  RETURN NEW;
END
$$;

CREATE FUNCTION public.save_tutor_details(p_tutor_id uuid, p_phone text, p_details jsonb) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE details public."TutorDetails";
BEGIN
  IF coalesce(public.current_app_role(), '') NOT IN ('admin', 'tutor') THEN RAISE EXCEPTION 'Not allowed to edit employee details.'; END IF;
  IF p_details IS NULL OR jsonb_typeof(p_details) <> 'object' THEN RAISE EXCEPTION 'Invalid employee details.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_object_keys(p_details) AS fields(key) WHERE key NOT IN ('date_of_birth', 'gender', 'address', 'job', 'start_date', 'end_date', 'emergency_contact_name', 'emergency_contact_mobile', 'start_hourly_rate', 'tfn', 'account_name', 'bsb', 'account_number', 'super_name', 'super_member_number', 'high_school', 'university_course', 'working_with_children', 'police_check', 'special_skills', 'hsc_subjects')) THEN
    RAISE EXCEPTION 'Name, email, and account links cannot be changed through this form.';
  END IF;
  IF public.current_app_role() = 'tutor' AND p_details ?| ARRAY['job', 'start_date', 'end_date', 'start_hourly_rate', 'tfn', 'account_name', 'bsb', 'account_number', 'super_name', 'super_member_number'] THEN
    RAISE EXCEPTION 'Only administrators can change employment and payroll details.';
  END IF;
  IF p_phone IS NULL OR length(btrim(p_phone)) NOT BETWEEN 1 AND 40 THEN RAISE EXCEPTION 'Enter a mobile number.'; END IF;
  UPDATE public."Tutor" SET phone = btrim(p_phone) WHERE tutor_id = p_tutor_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Employee not found or access denied.'; END IF;
  SELECT * INTO details FROM jsonb_populate_record(NULL::public."TutorDetails", p_details);
  INSERT INTO public."TutorDetails" (tutor_id, date_of_birth, gender, address, job, start_date, end_date, emergency_contact_name, emergency_contact_mobile, start_hourly_rate, tfn, account_name, bsb, account_number, super_name, super_member_number, high_school, university_course, working_with_children, police_check, special_skills, hsc_subjects)
    VALUES (p_tutor_id, details.date_of_birth, details.gender, details.address, coalesce(details.job, 'Tutor'), details.start_date, details.end_date, details.emergency_contact_name, details.emergency_contact_mobile, details.start_hourly_rate, details.tfn, details.account_name, details.bsb, details.account_number, details.super_name, details.super_member_number, details.high_school, details.university_course, details.working_with_children, details.police_check, details.special_skills, coalesce(details.hsc_subjects, '{}'::text[]))
    ON CONFLICT (tutor_id) DO UPDATE SET
    date_of_birth = CASE WHEN p_details ? 'date_of_birth' THEN EXCLUDED.date_of_birth ELSE public."TutorDetails".date_of_birth END,
    gender = CASE WHEN p_details ? 'gender' THEN EXCLUDED.gender ELSE public."TutorDetails".gender END,
    address = CASE WHEN p_details ? 'address' THEN EXCLUDED.address ELSE public."TutorDetails".address END,
    job = CASE WHEN p_details ? 'job' THEN EXCLUDED.job ELSE public."TutorDetails".job END,
    start_date = CASE WHEN p_details ? 'start_date' THEN EXCLUDED.start_date ELSE public."TutorDetails".start_date END,
    end_date = CASE WHEN p_details ? 'end_date' THEN EXCLUDED.end_date ELSE public."TutorDetails".end_date END,
    emergency_contact_name = CASE WHEN p_details ? 'emergency_contact_name' THEN EXCLUDED.emergency_contact_name ELSE public."TutorDetails".emergency_contact_name END,
    emergency_contact_mobile = CASE WHEN p_details ? 'emergency_contact_mobile' THEN EXCLUDED.emergency_contact_mobile ELSE public."TutorDetails".emergency_contact_mobile END,
    start_hourly_rate = CASE WHEN p_details ? 'start_hourly_rate' THEN EXCLUDED.start_hourly_rate ELSE public."TutorDetails".start_hourly_rate END,
    tfn = CASE WHEN p_details ? 'tfn' THEN EXCLUDED.tfn ELSE public."TutorDetails".tfn END,
    account_name = CASE WHEN p_details ? 'account_name' THEN EXCLUDED.account_name ELSE public."TutorDetails".account_name END,
    bsb = CASE WHEN p_details ? 'bsb' THEN EXCLUDED.bsb ELSE public."TutorDetails".bsb END,
    account_number = CASE WHEN p_details ? 'account_number' THEN EXCLUDED.account_number ELSE public."TutorDetails".account_number END,
    super_name = CASE WHEN p_details ? 'super_name' THEN EXCLUDED.super_name ELSE public."TutorDetails".super_name END,
    super_member_number = CASE WHEN p_details ? 'super_member_number' THEN EXCLUDED.super_member_number ELSE public."TutorDetails".super_member_number END,
    high_school = CASE WHEN p_details ? 'high_school' THEN EXCLUDED.high_school ELSE public."TutorDetails".high_school END,
    university_course = CASE WHEN p_details ? 'university_course' THEN EXCLUDED.university_course ELSE public."TutorDetails".university_course END,
    working_with_children = CASE WHEN p_details ? 'working_with_children' THEN EXCLUDED.working_with_children ELSE public."TutorDetails".working_with_children END,
    police_check = CASE WHEN p_details ? 'police_check' THEN EXCLUDED.police_check ELSE public."TutorDetails".police_check END,
    special_skills = CASE WHEN p_details ? 'special_skills' THEN EXCLUDED.special_skills ELSE public."TutorDetails".special_skills END,
    hsc_subjects = CASE WHEN p_details ? 'hsc_subjects' THEN EXCLUDED.hsc_subjects ELSE public."TutorDetails".hsc_subjects END;
END
$$;
REVOKE ALL ON FUNCTION public.save_tutor_details(uuid, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_tutor_details(uuid, text, jsonb) TO authenticated;

CREATE FUNCTION public.create_employee(p_first_name text, p_last_name text, p_email text, p_phone text, p_details jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE created_id uuid;
BEGIN
  IF public.current_app_role() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Only administrators can create employees.'; END IF;
  IF p_first_name IS NULL OR length(btrim(p_first_name)) NOT BETWEEN 1 AND 100
    OR p_last_name IS NULL OR length(btrim(p_last_name)) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Enter a first and last name.'; END IF;
  IF p_email IS NULL OR length(p_email) > 254 OR p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Enter a valid email address.';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(lower(btrim(p_email)), 0));
  IF EXISTS (SELECT 1 FROM public."Tutor" WHERE lower(btrim(email)) = lower(btrim(p_email))) THEN
    RAISE EXCEPTION 'An employee with this email already exists.';
  END IF;
  INSERT INTO public."Tutor" (first_name, last_name, email, phone)
    VALUES (btrim(p_first_name), btrim(p_last_name), lower(btrim(p_email)), btrim(p_phone)) RETURNING tutor_id INTO created_id;
  PERFORM public.save_tutor_details(created_id, p_phone, p_details);
  RETURN created_id;
END
$$;
REVOKE ALL ON FUNCTION public.create_employee(text, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_employee(text, text, text, text, jsonb) TO authenticated;
COMMIT;
