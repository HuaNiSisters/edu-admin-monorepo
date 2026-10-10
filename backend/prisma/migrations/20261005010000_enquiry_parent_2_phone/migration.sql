-- Requires the Enquiry table migration already merged into master.
ALTER TABLE public."Enquiry"
  ADD COLUMN parent_2_phone_number text;
