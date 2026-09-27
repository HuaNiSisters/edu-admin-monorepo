-- Job is the employee's application role, rather than a free-text title.
BEGIN;

-- Preserve existing trusted account roles when normalizing legacy job values.
UPDATE public."TutorDetails" d SET job = CASE
  WHEN u.raw_app_meta_data ->> 'role' IN ('admin', 'reception', 'tutor') THEN u.raw_app_meta_data ->> 'role'
  WHEN lower(btrim(d.job)) IN ('admin', 'reception', 'tutor') THEN lower(btrim(d.job))
  ELSE 'tutor' END
FROM public."Tutor" t LEFT JOIN auth.users u ON u.id = t.auth_user_id
WHERE d.tutor_id = t.tutor_id;
ALTER TABLE public."TutorDetails" ALTER COLUMN job SET DEFAULT 'tutor';
ALTER TABLE public."TutorDetails" ADD CONSTRAINT employee_job_role CHECK (job IN ('admin', 'reception', 'tutor'));

INSERT INTO public."TutorDetails" (tutor_id, job)
SELECT t.tutor_id, CASE WHEN u.raw_app_meta_data ->> 'role' IN ('admin', 'reception', 'tutor')
  THEN u.raw_app_meta_data ->> 'role' ELSE 'tutor' END
FROM public."Tutor" t LEFT JOIN auth.users u ON u.id = t.auth_user_id
WHERE NOT EXISTS (SELECT 1 FROM public."TutorDetails" d WHERE d.tutor_id = t.tutor_id);

CREATE OR REPLACE FUNCTION public.protect_employee_employment_fields() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.tutor_id IS DISTINCT FROM OLD.tutor_id THEN
    RAISE EXCEPTION 'An employee details record cannot be reassigned.';
  END IF;
  IF current_user = 'authenticated' AND public.current_app_role() <> 'admin' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.job <> 'tutor' OR NEW.start_date IS NOT NULL OR NEW.end_date IS NOT NULL OR NEW.start_hourly_rate IS NOT NULL OR NEW.tfn IS NOT NULL OR NEW.account_name IS NOT NULL OR NEW.bsb IS NOT NULL OR NEW.account_number IS NOT NULL OR NEW.super_name IS NOT NULL OR NEW.super_member_number IS NOT NULL THEN
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

CREATE OR REPLACE FUNCTION public.save_tutor_details(p_tutor_id uuid, p_phone text, p_details jsonb) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE details public."TutorDetails";
BEGIN
  IF coalesce(public.current_app_role(), '') NOT IN ('admin', 'reception', 'tutor') THEN RAISE EXCEPTION 'Not allowed to edit employee details.'; END IF;
  IF p_details IS NULL OR jsonb_typeof(p_details) <> 'object' THEN RAISE EXCEPTION 'Invalid employee details.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_object_keys(p_details) AS fields(key) WHERE key NOT IN ('date_of_birth', 'gender', 'address', 'job', 'start_date', 'end_date', 'emergency_contact_name', 'emergency_contact_mobile', 'start_hourly_rate', 'tfn', 'account_name', 'bsb', 'account_number', 'super_name', 'super_member_number', 'high_school', 'university_course', 'working_with_children', 'police_check', 'special_skills', 'hsc_subjects')) THEN
    RAISE EXCEPTION 'Name, email, and account links cannot be changed through this form.';
  END IF;
  IF public.current_app_role() <> 'admin' AND p_details ?| ARRAY['job', 'start_date', 'end_date', 'start_hourly_rate', 'tfn', 'account_name', 'bsb', 'account_number', 'super_name', 'super_member_number'] THEN
    RAISE EXCEPTION 'Only administrators can change employment and payroll details.';
  END IF;
  IF p_phone IS NULL OR length(btrim(p_phone)) NOT BETWEEN 1 AND 40 THEN RAISE EXCEPTION 'Enter a mobile number.'; END IF;
  UPDATE public."Tutor" SET phone = btrim(p_phone) WHERE tutor_id = p_tutor_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Employee not found or access denied.'; END IF;
  SELECT * INTO details FROM jsonb_populate_record(NULL::public."TutorDetails", p_details);
  INSERT INTO public."TutorDetails" (tutor_id, date_of_birth, gender, address, job, start_date, end_date, emergency_contact_name, emergency_contact_mobile, start_hourly_rate, tfn, account_name, bsb, account_number, super_name, super_member_number, high_school, university_course, working_with_children, police_check, special_skills, hsc_subjects)
    VALUES (p_tutor_id, details.date_of_birth, details.gender, details.address, coalesce(details.job, 'tutor'), details.start_date, details.end_date, details.emergency_contact_name, details.emergency_contact_mobile, details.start_hourly_rate, details.tfn, details.account_name, details.bsb, details.account_number, details.super_name, details.super_member_number, details.high_school, details.university_course, details.working_with_children, details.police_check, details.special_skills, coalesce(details.hsc_subjects, '{}'::text[]))
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

-- Non-admin staff can edit their own personal details; managed fields remain
-- protected by the trigger and the save function above.
ALTER POLICY tutor_account_boundary ON public."Tutor"
  USING (public.current_app_role() IN ('admin', 'reception') OR (public.current_app_role() = 'tutor' AND auth_user_id = auth.uid()))
  WITH CHECK (public.current_app_role() = 'admin' OR (public.current_app_role() IN ('reception', 'tutor') AND auth_user_id = auth.uid()));
ALTER POLICY tutor_update ON public."Tutor"
  USING (public.current_app_role() = 'admin' OR (public.current_app_role() IN ('reception', 'tutor') AND auth_user_id = auth.uid()));
ALTER POLICY employee_private_details ON public."TutorDetails"
  USING (public.current_app_role() = 'admin' OR (public.current_app_role() IN ('reception', 'tutor') AND EXISTS (
    SELECT 1 FROM public."Tutor" t WHERE t.tutor_id = "TutorDetails".tutor_id AND t.auth_user_id = auth.uid()
  )))
  WITH CHECK (public.current_app_role() = 'admin' OR (public.current_app_role() IN ('reception', 'tutor') AND EXISTS (
    SELECT 1 FROM public."Tutor" t WHERE t.tutor_id = "TutorDetails".tutor_id AND t.auth_user_id = auth.uid()
  )));

CREATE OR REPLACE FUNCTION private.link_created_tutor() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_id uuid; expected_role text;
BEGIN
  IF NEW.raw_app_meta_data ->> 'tutor_id' IS NULL THEN RETURN NEW; END IF;
  target_id := (NEW.raw_app_meta_data ->> 'tutor_id')::uuid;
  SELECT coalesce(d.job, 'tutor') INTO expected_role FROM public."Tutor" t
    LEFT JOIN public."TutorDetails" d ON d.tutor_id = t.tutor_id
    WHERE t.tutor_id = target_id FOR UPDATE OF t;
  IF NOT FOUND OR expected_role IS DISTINCT FROM (NEW.raw_app_meta_data ->> 'role') THEN
    RAISE EXCEPTION 'Account role must match the employee job.';
  END IF;
  UPDATE public."Tutor" SET auth_user_id = NEW.id
    WHERE tutor_id = target_id AND (auth_user_id IS NULL OR auth_user_id = NEW.id)
      AND lower(btrim(email)) = lower(NEW.email);
  IF NOT FOUND THEN RAISE EXCEPTION 'Employee is already linked, missing, or their email has changed.'; END IF;
  RETURN NEW;
END
$$;

CREATE FUNCTION private.sync_employee_account_role() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.job IS NOT DISTINCT FROM OLD.job THEN RETURN NEW; END IF;
  UPDATE auth.users u SET raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.job)
    FROM public."Tutor" t WHERE t.tutor_id = NEW.tutor_id AND u.id = t.auth_user_id
      AND (u.raw_app_meta_data ->> 'role') IS DISTINCT FROM NEW.job;
  RETURN NEW;
END
$$;
CREATE TRIGGER sync_employee_account_role AFTER INSERT OR UPDATE OF job ON public."TutorDetails"
  FOR EACH ROW EXECUTE FUNCTION private.sync_employee_account_role();

-- Return directory fields only. Reception cannot read private payroll records
-- merely to populate the class picker.
CREATE FUNCTION public.get_teaching_tutors() RETURNS SETOF public."Tutor"
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF coalesce(public.current_app_role(), '') NOT IN ('admin', 'reception') THEN RAISE EXCEPTION 'Access denied.'; END IF;
  RETURN QUERY SELECT t.* FROM public."Tutor" t
    LEFT JOIN public."TutorDetails" d ON d.tutor_id = t.tutor_id
    WHERE coalesce(d.job, 'tutor') = 'tutor' ORDER BY t.first_name, t.last_name;
END
$$;
REVOKE ALL ON FUNCTION public.get_teaching_tutors() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_teaching_tutors() TO authenticated;
COMMIT;
