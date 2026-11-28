BEGIN;

ALTER TABLE public."PaymentFollowUp"
  ADD COLUMN is_completed boolean NOT NULL DEFAULT false;

DROP POLICY payment_follow_up_staff_complete ON public."PaymentFollowUp";
REVOKE DELETE ON public."PaymentFollowUp" FROM authenticated;
GRANT UPDATE (is_completed) ON public."PaymentFollowUp" TO authenticated;

CREATE POLICY payment_follow_up_staff_complete ON public."PaymentFollowUp"
  FOR UPDATE TO authenticated
  USING (NOT is_completed AND public.current_app_role() IN ('admin', 'reception'))
  WITH CHECK (is_completed AND public.current_app_role() IN ('admin', 'reception'));

-- Recover tasks completed under the original workflow, which deleted the task
-- and kept the follow-up date on the payment.
INSERT INTO public."PaymentFollowUp" (payment_id, due_date, is_completed)
SELECT payment_id, follow_up_date, true
FROM public."Payment"
WHERE follow_up_date IS NOT NULL
ON CONFLICT (payment_id) DO NOTHING;

DROP INDEX public.payment_follow_up_due_date_idx;
CREATE INDEX payment_follow_up_status_due_date_idx
  ON public."PaymentFollowUp" (is_completed, due_date, payment_id);

COMMIT;
