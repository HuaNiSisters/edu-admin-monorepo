import { Database } from "./database.types";

//////////////////////////////////////////////////////////////////
  // STUDENTS
  //////////////////////////////////////////////////////////////////
type Location = Database["public"]["Enums"]["Location"];
type StudentStatus = Database["public"]["Enums"]["StudentStatus"];
type Gender = Database["public"]["Enums"]["Gender"];
type SubjectOffering = Database["public"]["Tables"]["SubjectOffering"]["Row"];
type ClassTime = Database["public"]["Tables"]["ClassTime"]["Row"];

type CreateStudentDataParams = Database["public"]["Tables"]["Student"]["Insert"];
type CreateParentDataParams = Database["public"]["Tables"]["Parent"]["Insert"];
type CreateStudentParams = {
  studentData: CreateStudentDataParams;
  parent1Data: CreateParentDataParams;
  parent2Data?: CreateParentDataParams;
}

type ParentInfo = Database["public"]["Tables"]["Parent"]["Row"];
type StudentInfo = Database["public"]["Tables"]["Student"]["Row"];
type StudentData = StudentInfo & {
  parent1Id: string;
  parent1FullName: string;
  parent1Mobile: string;
  parent2Id?: string;
  parent2FullName?: string;
  parent2Mobile?: string;
}

type EmployeeInfo = Database["public"]["Tables"]["Tutor"]["Row"];

type UpdateStudentDataParams = {
  studentData: Partial<Omit<CreateStudentDataParams, "student_id">>;
  parent1Data: Partial<CreateParentDataParams>;
  parent2Data?: Partial<CreateParentDataParams>;
}

type SearchStudentsResponse = {
  student_id: StudentInfo["student_id"];
  first_name: StudentInfo["first_name"];
  last_name: StudentInfo["last_name"];
  email: StudentInfo["email"];
  student_mobile: StudentInfo["student_mobile"];
  parents: {
    parent_id: ParentInfo["parent_id"];
    first_name: ParentInfo["first_name"];
    parent_mobile: ParentInfo["parent_mobile"];
  }[];
}[];

type CreateSubjectDataParams = Database["public"]["Tables"]["SubjectOffering"]["Insert"];
type UpdateSubjectDataParams = Partial<Omit<CreateSubjectDataParams, "subject_id">>;

type UpdateClassDataParams = Partial<Omit<CreateClassDataParams, "class_id">>;

type ClassTimeWithSubjectAndTutor = ClassTime & {
  subject_name?: string;
  grade?: string | null;
  location?: string | null;
  tutor?: string | null;
};

type GetLocationsResponse = Location[];
type GetStatusesResponse = StudentStatus[];
type GetGendersResponse = Gender[];
type GetSubjectOfferingsResponse = SubjectOffering[];
type GetClassTimesResponse = ClassTimeWithSubjectAndTutor[];
type GetTutorsResponse = EmployeeInfo[];

//////////////////////////////////////////////////////////////////
  // CLASSES
  //////////////////////////////////////////////////////////////////
type CreateClassDataParams = Database["public"]["Tables"]["ClassTime"]["Insert"];


export type {
  Location,
  StudentStatus,
  Gender,
  StudentData,
  ParentInfo,
  EmployeeInfo,
  SubjectOffering,
  ClassTime,
  ClassTimeWithSubjectAndTutor,
  CreateStudentDataParams,
  CreateSubjectDataParams,
  UpdateSubjectDataParams,
  CreateClassDataParams,
  UpdateClassDataParams,
  CreateParentDataParams,
  CreateStudentParams,
  UpdateStudentDataParams,
  SearchStudentsResponse,
  GetLocationsResponse,
  GetStatusesResponse,
  GetGendersResponse,
  GetSubjectOfferingsResponse,
  GetClassTimesResponse,
  GetTutorsResponse,
}

export interface ApiWrapper {
  // Subjects
  createSubjectAsync: (data: CreateSubjectDataParams) => Promise<SubjectOffering>;
  updateSubjectAsync: (id: string, data: UpdateSubjectDataParams) => Promise<SubjectOffering>;
  getSubjectOfferingsAsync: () => Promise<GetSubjectOfferingsResponse>;

  // Classes
  createClassAsync: (data: CreateClassDataParams) => Promise<ClassTime>;
  updateClassAsync: (id: string, data: UpdateClassDataParams) => Promise<ClassTime>;
  getClassTimesAsync: () => Promise<GetClassTimesResponse>;

  // Students
  createStudentAsync: (data: CreateStudentParams) => Promise<StudentData>;
  getStudentByIdAsync: (id: string) => Promise<StudentData>;
  updateStudentAsync: (id: string, data: UpdateStudentDataParams) => Promise<StudentData>;
  searchStudentsAsync: (query: string) => Promise<SearchStudentsResponse>;

  // Tutors 
  // TODO: add createTutorsAsync, updateTutorAsync
  getTutorsAsync: () => Promise<GetTutorsResponse>;

  // Lookups
  getLocationsAsync: () => Promise<GetLocationsResponse>;
  getStatusesAsync: () => Promise<GetStatusesResponse>;
  getGendersAsync: () => Promise<GetGendersResponse>;
}