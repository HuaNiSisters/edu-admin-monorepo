-- Tutors can use student search, student details, and attendance screens.
-- Keep those reads available across the student/class data set while retaining
-- admin/reception-only writes.
BEGIN;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'Student', 'Parent', 'StudentParent', 'ClassTime', 'SubjectOffering',
    'Term', 'Enrolment', 'Attendance'
  ] LOOP
    -- Replace the staff-only restrictive boundary with command-specific
    -- boundaries: all three staff roles may SELECT; only admin/reception may
    -- insert, update, or delete.
    EXECUTE format('DROP POLICY IF EXISTS staff_boundary ON public.%I', table_name);
    EXECUTE format('CREATE POLICY staff_boundary_select ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (public.current_app_role() IN (''admin'', ''reception'', ''tutor''))', table_name);
    EXECUTE format('CREATE POLICY staff_boundary_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.current_app_role() IN (''admin'', ''reception''))', table_name);
    EXECUTE format('CREATE POLICY staff_boundary_update ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.current_app_role() IN (''admin'', ''reception'')) WITH CHECK (public.current_app_role() IN (''admin'', ''reception''))', table_name);
    EXECUTE format('CREATE POLICY staff_boundary_delete ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (public.current_app_role() IN (''admin'', ''reception''))', table_name);

    -- Existing permissive policies may grant admin/reception reads only.
    -- This additive policy gives tutors SELECT access to the rows they need.
    EXECUTE format('CREATE POLICY tutor_student_data_read ON public.%I FOR SELECT TO authenticated USING (public.current_app_role() = ''tutor'')', table_name);
  END LOOP;
END
$$;

COMMIT;
