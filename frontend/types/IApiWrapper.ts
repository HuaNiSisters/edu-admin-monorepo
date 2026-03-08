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
type StudentData = Database["public"]["Tables"]["Student"]["Row"] & {
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

