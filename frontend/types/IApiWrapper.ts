import { Database } from "./database.types";

type Location = Database["public"]["Enums"]["Location"];
type StudentStatus = Database["public"]["Enums"]["StudentStatus"];
type Gender = Database["public"]["Enums"]["Gender"];

type CreateStudentDataParams = Database["public"]["Tables"]["Student"]["Insert"];
type StudentData = Database["public"]["Tables"]["Student"]["Row"];

type UpdateStudentDataParams = Partial<Omit<CreateStudentDataParams, "id">>;

type GetLocationsResponse = Location[];
type GetStatusesResponse = StudentStatus[];
type GetGendersResponse = Gender[];

export type {
  Location,
  StudentStatus,
  Gender,
  StudentData,
  CreateStudentDataParams,
  UpdateStudentDataParams,
  GetLocationsResponse,
  GetStatusesResponse,
  GetGendersResponse,
}

export interface ApiWrapper {
  createStudentAsync: (data: CreateStudentDataParams) => Promise<StudentData>;
  getStudentByIdAsync: (id: string) => Promise<StudentData>;
  updateStudentAsync: (id: string, data: UpdateStudentDataParams) => Promise<StudentData>;
  getLocationsAsync: () => Promise<GetLocationsResponse>;
  getStatusesAsync: () => Promise<GetStatusesResponse>;
  getGendersAsync: () => Promise<GetGendersResponse>;
}

