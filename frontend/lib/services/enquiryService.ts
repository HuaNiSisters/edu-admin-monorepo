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
      parent_2_phone_number: parsed.parent_2_phone_number || null,
      grade: Number(parsed.grade),
      subject_selection: [...new Set(parsed.subject_selection.split(",").map(subject => subject.trim()).filter(Boolean))],
      preferred_campus: parsed.preferred_campus || null,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return data as Enquiry;
  },
  async getById(id: string): Promise<Enquiry> {
    const { data, error } = await createClient().from("Enquiry").select("*").eq("enquiry_id", id).single();
    if (error) throw new Error(error.message);
    return data as Enquiry;
  },
  async update(id: string, values: EnquiryFormValues): Promise<Enquiry> {
    const parsed = enquiryFormSchema.parse(values);
    const { data, error } = await createClient().from("Enquiry").update({
      ...parsed,
      parent_2_phone_number: parsed.parent_2_phone_number || null,
      grade: Number(parsed.grade),
      subject_selection: [...new Set(parsed.subject_selection.split(",").map(subject => subject.trim()).filter(Boolean))],
      preferred_campus: parsed.preferred_campus || null,
    }).eq("enquiry_id", id).select("*").single();
    if (error) throw new Error(error.message);
    return data as Enquiry;
  },
  async close(ids: string[]): Promise<void> {
    const { error } = await createClient()
      .from("Enquiry")
      .update({ is_closed: true, closed_at: new Date().toISOString() })
      .in("enquiry_id", ids);
    if (error) throw new Error(error.message);
  },
  async reopen(ids: string[]): Promise<void> {
    const { error } = await createClient()
      .from("Enquiry")
      .update({ is_closed: false, closed_at: null })
      .in("enquiry_id", ids);
    if (error) throw new Error(error.message);
  },
};
