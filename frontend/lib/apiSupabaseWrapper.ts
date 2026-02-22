import { createClient } from "./supabase/client";
import { Constants } from "../types/database.types";
import {
  ApiWrapper,
  CreateClassDataParams,
  CreateClassDataResponse,
  CreateStudentDataParams,
  CreateStudentDataResponse,
  GetGendersResponse,
  GetLocationsResponse,
  GetStatusesResponse,
} from "@/types/IApiWrapper";

class ApiSupabaseWrapper implements ApiWrapper {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  //////////////////////////////////////////////////////////////////
  // STUDENTS
  //////////////////////////////////////////////////////////////////
  async createStudentAsync(
    data: CreateStudentDataParams,
  ): Promise<CreateStudentDataResponse> {
    console.log({ createStudentData: data });
    const { data: responseData, error } = await this.supabase
      .from("Student")
      .insert(data)
      .select()
      .single();
    return responseData;
  }

  async getLocationsAsync(): Promise<GetLocationsResponse> {
    return Object.values(Constants.public.Enums.Location);
  }

  async getStatusesAsync(): Promise<GetStatusesResponse> {
    return Object.values(Constants.public.Enums.StudentStatus);
  }

  async getGendersAsync(): Promise<GetGendersResponse> {
    return Object.values(Constants.public.Enums.Gender);
  }

  //////////////////////////////////////////////////////////////////
  // CLASSES
  //////////////////////////////////////////////////////////////////
  async createClassAsync(
    data: CreateClassDataParams,
  ): Promise<CreateClassDataResponse> {
    console.log({ createClassData: data });
    const { data: responseData, error } = await this.supabase
      .from("ClassTime")
      .insert(data)
      .select()
      .single();
    return responseData;
  }


}

export default ApiSupabaseWrapper;
