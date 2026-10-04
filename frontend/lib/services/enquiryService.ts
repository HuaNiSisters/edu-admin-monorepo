import { createClient } from "@/lib/api/supabase/client";
import { Enquiry } from "@/lib/api/types/enquiry";
import { enquiryFormSchema, EnquiryFormValues } from "@/lib/validation/enquiry";

export const enquiryService = {
  async list(): Promise<Enquiry[]> {
    const { data, error } = await createClient().from("Enquiry").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Enquiry[];
  },
  async create(values: EnquiryFormValues): Promise<Enquiry> {
    const parsed = enquiryFormSchema.parse(values);
    const { data, error } = await createClient().from("Enquiry").insert({
      ...parsed,
      grade: Number(parsed.grade),
      subject_selection: [...new Set(parsed.subject_selection.split(",").map(subject => subject.trim()).filter(Boolean))],
      preferred_campus: parsed.preferred_campus || null,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return data as Enquiry;
  },
};
