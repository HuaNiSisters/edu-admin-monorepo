ALTER TABLE public."Enquiry"
  ADD COLUMN is_closed boolean NOT NULL DEFAULT false,
  ADD COLUMN closed_at timestamptz;

CREATE INDEX enquiry_open_created_at_idx
  ON public."Enquiry" (is_closed, created_at DESC);
