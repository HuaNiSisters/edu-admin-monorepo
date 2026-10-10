export const ENQUIRY_CAMPUSES = [
  "Parramatta",
  "Cabramatta & Canley",
] as const;

export interface Enquiry {
  enquiry_id: string;
  created_at: string;
  // "Website" for online submissions, or the staff member's name.
  created_by: string;
  first_name: string;
  surname: string;
  gender: string | null;
  school: string;
  grade: number;
  student_phone_number?: string | null;
  email_address: string | null;
  parent_name: string | null;
  parent_phone_number: string;
  parent_2_phone_number?: string | null;
  suburb_of_home: string;
  subject_selection: string[];
  preferred_campus: (typeof ENQUIRY_CAMPUSES)[number] | null;
  preferred_class_days_times: string | null;
  hear_about_us: string | null;
  reference: string | null;
  additional_comments: string | null;
}
