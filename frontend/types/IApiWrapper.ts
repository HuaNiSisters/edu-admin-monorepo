import { Database } from "./database.types";

type Location = Database["public"]["Enums"]["Location"];
type StudentStatus = Database["public"]["Enums"]["StudentStatus"];
type Gender = Database["public"]["Enums"]["Gender"];
type SubjectOffering = Database["public"]["Tables"]["SubjectOffering"]["Row"];

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

type GetLocationsResponse = Location[];
type GetStatusesResponse = StudentStatus[];
type GetGendersResponse = Gender[];
type GetSubjectOfferingsResponse = SubjectOffering[];

export type {
  Location,
  StudentStatus,
  Gender,
  StudentData,
  SubjectOffering,
  CreateStudentDataParams,
  CreateSubjectDataParams,
  UpdateSubjectDataParams,
  CreateParentDataParams,
  CreateStudentParams,
  UpdateStudentDataParams,
  SearchStudentsResponse,
  GetLocationsResponse,
  GetStatusesResponse,
  GetGendersResponse,
  GetSubjectOfferingsResponse,
}

export interface ApiWrapper {
  createSubjectAsync: (data: CreateSubjectDataParams) => Promise<SubjectOffering>;
  createStudentAsync: (data: CreateStudentParams) => Promise<StudentData>;
  getStudentByIdAsync: (id: string) => Promise<StudentData>;
  updateStudentAsync: (id: string, data: UpdateStudentDataParams) => Promise<StudentData>;
  updateSubjectAsync: (id: string, data: UpdateSubjectDataParams) => Promise<SubjectOffering>;
  getSubjectOfferingsAsync: () => Promise<GetSubjectOfferingsResponse>
  getLocationsAsync: () => Promise<GetLocationsResponse>;
  getStatusesAsync: () => Promise<GetStatusesResponse>;
  getGendersAsync: () => Promise<GetGendersResponse>;
}

