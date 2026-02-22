import { Database } from "./database.types";

type Location = Database["public"]["Enums"]["Location"];
type StudentStatus = Database["public"]["Enums"]["StudentStatus"];
type Gender = Database["public"]["Enums"]["Gender"];

type CreateStudentDataParams = Omit<Database["public"]["Tables"]["Student"]["Insert"], "student_id">;
type CreateStudentDataResponse = Database["public"]["Tables"]["Student"]["Row"];

type GetLocationsResponse = Location[];
type GetStatusesResponse = StudentStatus[];
type GetGendersResponse = Gender[];

export type {
  Location,
  StudentStatus,
  Gender,
  CreateStudentDataParams,
  CreateStudentDataResponse,
  GetLocationsResponse,
  GetStatusesResponse,
  GetGendersResponse,
}

export interface ApiWrapper {
  createStudentAsync: (data: CreateStudentDataParams) => Promise<CreateStudentDataResponse>;
  getLocationsAsync: () => Promise<GetLocationsResponse>;
  getStatusesAsync: () => Promise<GetStatusesResponse>;
  getGendersAsync: () => Promise<GetGendersResponse>;
}

