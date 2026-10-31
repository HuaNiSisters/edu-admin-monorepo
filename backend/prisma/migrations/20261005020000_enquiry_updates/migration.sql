-- Allow reception and admin to edit enquiries through the authenticated app.
GRANT UPDATE ON public."Enquiry" TO authenticated;
CREATE POLICY enquiry_staff_update ON public."Enquiry" FOR UPDATE TO authenticated
  USING (public.current_app_role() IN ('admin', 'reception'))
  WITH CHECK (public.current_app_role() IN ('admin', 'reception'));
