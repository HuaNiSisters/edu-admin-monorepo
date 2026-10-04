-- Ensure admins and reception can read the student and attendance data used
-- by their screens even when older table policies are narrower (for example,
-- admin-only). Existing restrictive role boundaries still apply.
BEGIN;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'Student', 'Parent', 'StudentParent', 'ClassTime', 'SubjectOffering',
    'Term', 'Enrolment', 'Attendance', 'Payment'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY staff_student_data_read ON public.%I FOR SELECT TO authenticated USING (public.current_app_role() IN (''admin'', ''reception''))',
      table_name
    );
  END LOOP;
END
$$;

COMMIT;
