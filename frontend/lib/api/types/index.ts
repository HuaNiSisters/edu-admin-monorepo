import { Database } from "../../../types/database.types";

type Location = Database["public"]["Enums"]["Location"];
type StudentStatus = Database["public"]["Enums"]["StudentStatus"];
type Gender = Database["public"]["Enums"]["Gender"];
type SubjectOffering = Database["public"]["Tables"]["SubjectOffering"]["Row"];
type ClassTime = Database["public"]["Tables"]["ClassTime"]["Row"];

type ParentInfo = Database["public"]["Tables"]["Parent"]["Row"];
type StudentInfo = Database["public"]["Tables"]["Student"]["Row"];
type StudentData = StudentInfo & {
  parent1Id: string;
  parent1FullName: string;
  parent1Mobile: string;
  parent2Id?: string;
  parent2FullName?: string;
  parent2Mobile?: string;
};

type EmployeeInfo = Database["public"]["Tables"]["Tutor"]["Row"];

type ClassTimeWithSubjectAndTutor = ClassTime & {
  subject_name?: string;
  grade?: string | null;
  location?: string | null;
  tutor?: string | null;
};



export type {
  Location,
  StudentStatus,
  Gender,
  SubjectOffering,
  ClassTime,
  ParentInfo,
  StudentInfo,
  StudentData,
  EmployeeInfo,
  ClassTimeWithSubjectAndTutor,
};
