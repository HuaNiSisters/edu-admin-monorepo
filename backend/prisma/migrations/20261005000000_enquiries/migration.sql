BEGIN;

CREATE TABLE public."Enquiry" (
  enquiry_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL,
  first_name text NOT NULL CHECK (length(btrim(first_name)) > 0),
  surname text NOT NULL CHECK (length(btrim(surname)) > 0),
  parent_phone_number text NOT NULL CHECK (length(btrim(parent_phone_number)) > 0),
  school text NOT NULL CHECK (length(btrim(school)) > 0),
  grade integer NOT NULL CHECK (grade BETWEEN 1 AND 12),
  subject_selection text[] NOT NULL CHECK (cardinality(subject_selection) > 0 AND array_position(subject_selection, NULL) IS NULL AND array_to_string(subject_selection, '') ~ '[^[:space:]]'),
  suburb_of_home text NOT NULL CHECK (length(btrim(suburb_of_home)) > 0),
  gender text,
  student_phone_number text,
  email_address text,
  parent_name text,
  preferred_campus text CHECK (preferred_campus IN ('Parramatta', 'Cabramatta & Canley')),
  preferred_class_days_times text,
  hear_about_us text,
  reference text,
  additional_comments text
);

CREATE INDEX enquiry_created_at_idx ON public."Enquiry" (created_at DESC);

-- Attribution comes from the authenticated account, never a form field.
CREATE FUNCTION public.set_enquiry_creator() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    SELECT COALESCE(NULLIF(raw_user_meta_data->>'full_name', ''), email, id::text)
      INTO NEW.created_by FROM auth.users WHERE id = auth.uid();
    NEW.created_at := now();
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.set_enquiry_creator() FROM PUBLIC;
CREATE TRIGGER enquiry_creator BEFORE INSERT ON public."Enquiry"
FOR EACH ROW EXECUTE FUNCTION public.set_enquiry_creator();

ALTER TABLE public."Enquiry" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."Enquiry" FROM anon, authenticated;
GRANT SELECT, INSERT ON public."Enquiry" TO authenticated;
GRANT ALL ON public."Enquiry" TO service_role;
CREATE POLICY enquiry_staff_read ON public."Enquiry" FOR SELECT TO authenticated
  USING (public.current_app_role() IN ('admin', 'reception'));
CREATE POLICY enquiry_staff_create ON public."Enquiry" FOR INSERT TO authenticated
  WITH CHECK (public.current_app_role() IN ('admin', 'reception'));

COMMIT;
