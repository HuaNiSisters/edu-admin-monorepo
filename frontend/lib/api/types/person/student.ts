import { Database } from "../../../../types/database.types";
import { ParentInfo, StudentInfo, StudentStatus } from "..";
import { CreateParentDataParams } from "./parent";

type GetStatusesResponse = StudentStatus[];

type CreateStudentDataParams =
  Database["public"]["Tables"]["Student"]["Insert"];
type CreateStudentParams = {
  studentData: CreateStudentDataParams;
  parent1Data: CreateParentDataParams;
  parent2Data?: CreateParentDataParams;
};

type UpdateStudentDataParams = {
  studentData: Partial<Omit<CreateStudentDataParams, "student_id">>;
  parent1Data: Partial<CreateParentDataParams>;
  parent2Data?: Partial<CreateParentDataParams>;
};

type SearchStudentsResponse = {
  student_id: StudentInfo["student_id"];
  first_name: StudentInfo["first_name"];
  last_name: StudentInfo["last_name"];
  email: StudentInfo["email"];
  student_mobile: StudentInfo["student_mobile"];
  gender: StudentInfo["gender"];
  grade_at_school: StudentInfo["grade_at_school"];
  school: StudentInfo["school"];
  status: StudentInfo["status"];
  parents: {
    parent_id: ParentInfo["parent_id"];
    first_name: ParentInfo["first_name"];
    parent_mobile: ParentInfo["parent_mobile"];
  }[];
  recent_term: { term_id: string; name: number; year: number } | null;
  recent_enrolments: {
    enrolment_id: string;
    subject_name: string;
    grade: number;
    location: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    enrolment_date: string;
    latest_payment: {
      amount_paid: number;
      amount_due: number;
      payment_date: string | null;
      notes: string | null;
      status: "unpaid" | "partial" | "paid";
    } | null;
  }[] | null;
}[];

type StatusFilter = StudentStatus;

export type {
  GetStatusesResponse,
  CreateStudentDataParams,
  // CreateParentDataParams,
  CreateStudentParams,
  UpdateStudentDataParams,
  SearchStudentsResponse,
  StatusFilter
};
