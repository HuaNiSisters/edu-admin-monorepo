import { Database } from "../../../types/database.types";

type Location = Database["public"]["Enums"]["Location"];
type Gender = Database["public"]["Enums"]["Gender"];
type StudentStatus = Database["public"]["Enums"]["StudentStatus"];
type EnrolmentStatus = Database["public"]["Enums"]["EnrolmentStatus"];

type SubjectOffering = Database["public"]["Tables"]["SubjectOffering"]["Row"];
type Term = Database["public"]["Tables"]["Term"]["Row"];
type Enrolment = Database["public"]["Tables"]["Enrolment"]["Row"];
type ClassTime = Database["public"]["Tables"]["ClassTime"]["Row"];
type ParentInfo = Database["public"]["Tables"]["Parent"]["Row"];
type StudentInfo = Database["public"]["Tables"]["Student"]["Row"];
type EmployeeInfo = Database["public"]["Tables"]["Tutor"]["Row"];
type AttendanceStatus = Database["public"]["Enums"]["AttendanceStatus"];
type Attendance = Database["public"]["Tables"]["Attendance"]["Row"];

type StudentWithParents = StudentInfo & {
  parent1Id: string;
  parent1FullName: string;
  parent1Mobile: string;
  parent2Id?: string;
  parent2FullName?: string;
  parent2Mobile?: string;
};

type ClassTimeWithSubjectAndTutor = ClassTime & {
  subject_name?: string;
  grade?: string | null;
  location?: string | null;
  tutor?: string | null;
};

type EnrolmentWithClassAndTerm = Enrolment & {
  ClassTime: ClassTime & {
    SubjectOffering: SubjectOffering;
  };
  Term: Term;
}

export type {
  Location,
  Gender,
  StudentStatus,
  EnrolmentStatus,
  SubjectOffering,
  Term,
  Enrolment,
  ClassTime,
  ParentInfo,
  StudentInfo,
  StudentWithParents,
  EmployeeInfo,
  ClassTimeWithSubjectAndTutor,
  EnrolmentWithClassAndTerm,
  AttendanceStatus,
  Attendance,
};
