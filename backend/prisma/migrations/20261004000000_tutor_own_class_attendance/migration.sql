-- Tutors may search every student, but Attendance must expose only classes
-- assigned to their linked Tutor record. The prior tutor read migration grants
-- broad read access; these restrictive policies narrow class/attendance data.
BEGIN;

CREATE POLICY tutor_class_scope ON public."ClassTime" AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.current_app_role() <> 'tutor'
    OR "tutor_id" IN (
      SELECT t."tutor_id"
      FROM public."Tutor" t
      WHERE t."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY tutor_offering_scope ON public."SubjectOffering" AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.current_app_role() <> 'tutor'
    OR EXISTS (
      SELECT 1
      FROM public."ClassTime" ct
      WHERE ct."offering_id" = "SubjectOffering"."subject_id"
        AND ct."tutor_id" IN (
          SELECT t."tutor_id"
          FROM public."Tutor" t
          WHERE t."auth_user_id" = auth.uid()
        )
    )
  );

CREATE POLICY tutor_enrolment_scope ON public."Enrolment" AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.current_app_role() <> 'tutor'
    OR EXISTS (
      SELECT 1
      FROM public."ClassTime" ct
      WHERE ct."class_id" = "Enrolment"."class_id"
        AND ct."tutor_id" IN (
          SELECT t."tutor_id"
          FROM public."Tutor" t
          WHERE t."auth_user_id" = auth.uid()
        )
    )
  );

CREATE POLICY tutor_term_scope ON public."Term" AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.current_app_role() <> 'tutor'
    OR EXISTS (
      SELECT 1
      FROM public."Enrolment" e
      JOIN public."ClassTime" ct ON ct."class_id" = e."class_id"
      WHERE e."term_id" = "Term"."term_id"
        AND ct."tutor_id" IN (
          SELECT t."tutor_id"
          FROM public."Tutor" t
          WHERE t."auth_user_id" = auth.uid()
        )
    )
  );

CREATE POLICY tutor_attendance_scope ON public."Attendance" AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.current_app_role() <> 'tutor'
    OR EXISTS (
      SELECT 1
      FROM public."ClassTime" ct
      WHERE ct."class_id" = "Attendance"."class_id"
        AND ct."tutor_id" IN (
          SELECT t."tutor_id"
          FROM public."Tutor" t
          WHERE t."auth_user_id" = auth.uid()
        )
    )
  );

COMMIT;
