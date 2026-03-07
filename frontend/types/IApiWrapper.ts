import { Database } from "./database.types";

type Location = Database["public"]["Enums"]["Location"];
type StudentStatus = Database["public"]["Enums"]["StudentStatus"];
type Gender = Database["public"]["Enums"]["Gender"];
type SubjectOffering = Database["public"]["Tables"]["SubjectOffering"]["Row"];

type CreateStudentDataParams = Database["public"]["Tables"]["Student"]["Insert"];
type CreateStudentDataResponse = Database["public"]["Tables"]["Student"]["Row"];

type CreateSubjectDataParams = Database["public"]["Tables"]["SubjectOffering"]["Insert"];
type CreateSubjectDataResponse = Database["public"]["Tables"]["Student"]["Row"];
type UpdateSubjectDataParams = Partial<Omit<CreateSubjectDataParams, "subject_id">>;

type GetLocationsResponse = Location[];
type GetStatusesResponse = StudentStatus[];
type GetGendersResponse = Gender[];
type GetSubjectOfferingsResponse = SubjectOffering[];

export type {
  Location,
  StudentStatus,
  Gender,
  SubjectOffering,
  CreateStudentDataParams,
  CreateSubjectDataParams,
  UpdateSubjectDataParams,
  CreateStudentDataResponse,
  CreateSubjectDataResponse,
  GetLocationsResponse,
  GetStatusesResponse,
  GetGendersResponse,
  GetSubjectOfferingsResponse,
}

export interface ApiWrapper {
  createStudentAsync: (data: CreateStudentDataParams) => Promise<CreateStudentDataResponse>;
  createSubjectAsync: (data: CreateSubjectDataParams) => Promise<CreateSubjectDataResponse>;
  updateSubjectAsync: (id: string, data: UpdateSubjectDataParams) => Promise<SubjectOffering>;
  getLocationsAsync: () => Promise<GetLocationsResponse>;
  getStatusesAsync: () => Promise<GetStatusesResponse>;
  getGendersAsync: () => Promise<GetGendersResponse>;
  getSubjectOfferingsAsync: () => Promise<GetSubjectOfferingsResponse>
}

