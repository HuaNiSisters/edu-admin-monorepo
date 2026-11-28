BEGIN;

ALTER TABLE public."Payment" ADD COLUMN follow_up_date date;

CREATE TABLE public."PaymentFollowUp" (
  payment_id integer PRIMARY KEY REFERENCES public."Payment"(payment_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  due_date date NOT NULL
);

CREATE INDEX payment_follow_up_due_date_idx
  ON public."PaymentFollowUp" (due_date, payment_id);

ALTER TABLE public."PaymentFollowUp" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."PaymentFollowUp" FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public."PaymentFollowUp" TO authenticated;
GRANT ALL ON public."PaymentFollowUp" TO service_role;

CREATE POLICY payment_follow_up_staff_read ON public."PaymentFollowUp"
  FOR SELECT TO authenticated USING (public.current_app_role() IN ('admin', 'reception'));
CREATE POLICY payment_follow_up_staff_complete ON public."PaymentFollowUp"
  FOR DELETE TO authenticated USING (public.current_app_role() IN ('admin', 'reception'));

CREATE FUNCTION public.create_payment_follow_up() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public."PaymentFollowUp" (payment_id, due_date)
  VALUES (NEW.payment_id, NEW.follow_up_date);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_payment_follow_up() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER payment_follow_up_after_insert
  AFTER INSERT ON public."Payment"
  FOR EACH ROW WHEN (NEW.follow_up_date IS NOT NULL)
  EXECUTE FUNCTION public.create_payment_follow_up();

COMMIT;
