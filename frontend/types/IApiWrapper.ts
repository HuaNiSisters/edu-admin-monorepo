import { Database } from "./database.types";

//////////////////////////////////////////////////////////////////
  // STUDENTS
  //////////////////////////////////////////////////////////////////
type Location = Database["public"]["Enums"]["Location"];
type StudentStatus = Database["public"]["Enums"]["StudentStatus"];
type Gender = Database["public"]["Enums"]["Gender"];

type CreateStudentDataParams = Database["public"]["Tables"]["Student"]["Insert"];
type CreateStudentDataResponse = Database["public"]["Tables"]["Student"]["Row"];

type GetLocationsResponse = Location[];
type GetStatusesResponse = StudentStatus[];
type GetGendersResponse = Gender[];

//////////////////////////////////////////////////////////////////
  // CLASSES
  //////////////////////////////////////////////////////////////////
type CreateClassDataParams = Database["public"]["Tables"]["ClassTime"]["Insert"];
type CreateClassDataResponse = Database["public"]["Tables"]["ClassTime"]["Row"];


export type {
  Location,
  StudentStatus,
  Gender,
  CreateStudentDataParams,
  CreateStudentDataResponse,
  GetLocationsResponse,
  GetStatusesResponse,
  GetGendersResponse,
  CreateClassDataParams,
  CreateClassDataResponse
}

export interface ApiWrapper {
  createStudentAsync: (data: CreateStudentDataParams) => Promise<CreateStudentDataResponse>;
  getLocationsAsync: () => Promise<GetLocationsResponse>;
  getStatusesAsync: () => Promise<GetStatusesResponse>;
  getGendersAsync: () => Promise<GetGendersResponse>;
}

