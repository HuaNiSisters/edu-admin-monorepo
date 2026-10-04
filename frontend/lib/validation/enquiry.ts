import { z } from "zod";
import { ENQUIRY_CAMPUSES } from "@/lib/api/types/enquiry";

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`);
const phoneNumber = z.string().trim()
  .regex(/^[\d ]*$/, "Use digits only")
  .refine(value => value.replace(/\D/g, "").length <= 10, "Phone number cannot exceed 10 digits");

export const enquiryFormSchema = z.object({
  first_name: requiredText("First name"),
  surname: requiredText("Last name"),
  parent_phone_number: phoneNumber.refine(value => /\d/.test(value), "Parent mobile is required"),
  parent_2_phone_number: phoneNumber,
  school: requiredText("School"),
  grade: z.string().regex(/^(?:[1-9]|1[0-2])$/, "Grade must be between 1 and 12"),
  subject_selection: requiredText("Subject selection").refine(
    value => value.split(",").some(subject => subject.trim()),
    "Select at least one subject",
  ),
  suburb_of_home: requiredText("Suburb of home"),
  gender: z.string().trim(),
  student_phone_number: phoneNumber,
  email_address: z.union([z.literal(""), z.email("Enter a valid email address")]),
  parent_name: z.string().trim(),
  preferred_campus: z.union([z.literal(""), z.enum(ENQUIRY_CAMPUSES)]),
  preferred_class_days_times: z.string().trim(),
  hear_about_us: z.string().trim(),
  reference: z.string().trim(),
  additional_comments: z.string().trim(),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

export const enquiryDefaults: EnquiryFormValues = {
  first_name: "", surname: "", parent_phone_number: "", parent_2_phone_number: "", school: "", grade: "",
  subject_selection: "", suburb_of_home: "", gender: "", student_phone_number: "",
  email_address: "", parent_name: "", preferred_campus: "", preferred_class_days_times: "",
  hear_about_us: "", reference: "", additional_comments: "",
};
