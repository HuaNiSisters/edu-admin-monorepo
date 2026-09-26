import { Location } from ".";

export type StudentOwing = {
  enrolment_id: string;
  amount_outstanding: number;
  student_id: string;
  student_name: string;
  student_mobile: string;
  parents: { name: string; phone: string }[];
  term_id: string;
  term_name: number;
  term_year: number;
  term_label: string;
  subject_name: string;
  grade: number;
  location: Location;
  day_of_week: string;
  start_time: string;
  tutor: string;
};
