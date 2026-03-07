import { Database } from "./database.types";

type Location = Database["public"]["Enums"]["Location"];
type StudentStatus = Database["public"]["Enums"]["StudentStatus"];
type Gender = Database["public"]["Enums"]["Gender"];
type SubjectOffering = Database["public"]["Tables"]["SubjectOffering"]["Row"];

type CreateStudentDataParams = Database["public"]["Tables"]["Student"]["Insert"];
type StudentData = Database["public"]["Tables"]["Student"]["Row"];

type UpdateStudentDataParams = Partial<Omit<CreateStudentDataParams, "id">>;

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
  UpdateStudentDataParams,
  GetLocationsResponse,
  GetStatusesResponse,
  GetGendersResponse,
  GetSubjectOfferingsResponse,
}

export interface ApiWrapper {
  createStudentAsync: (data: CreateStudentDataParams) => Promise<StudentData>;
  createSubjectAsync: (data: CreateSubjectDataParams) => Promise<SubjectOffering>;
  updateStudentAsync: (id: string, data: UpdateStudentDataParams) => Promise<StudentData>;
  updateSubjectAsync: (id: string, data: UpdateSubjectDataParams) => Promise<SubjectOffering>;
  getStudentByIdAsync: (id: string) => Promise<StudentData>;
  getSubjectOfferingsAsync: () => Promise<GetSubjectOfferingsResponse>
  getLocationsAsync: () => Promise<GetLocationsResponse>;
  getStatusesAsync: () => Promise<GetStatusesResponse>;
  getGendersAsync: () => Promise<GetGendersResponse>;
}

