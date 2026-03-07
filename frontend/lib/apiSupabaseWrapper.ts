import { createClient } from "./supabase/client";
import { Constants } from "../types/database.types";
import {
  ApiWrapper,
  StudentData,
  CreateStudentDataParams,
  UpdateStudentDataParams,
  GetGendersResponse,
  GetLocationsResponse,
  GetStatusesResponse,
} from "@/types/IApiWrapper";

class ApiSupabaseWrapper implements ApiWrapper {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  async createStudentAsync(
    data: CreateStudentDataParams,
  ): Promise<StudentData> {
    console.log({ createStudentData: data });
    const { data: responseData, error } = await this.supabase
      .from("Student")
      .insert(data)
      .select()
      .single();
    return responseData;
  }

  async getStudentByIdAsync(
    id: string,
  ): Promise<StudentData> {
    const { data: responseData, error } = await this.supabase
      .from("Student")
      .select()
      .eq("student_id", id)
      .single();
    return responseData;
  }

  async updateStudentAsync(
    id: string,
    data: UpdateStudentDataParams,
  ): Promise<StudentData> {
    const { data: responseData, error } = await this.supabase
      .from("Student")
      .update(data)
      .eq("student_id", id)
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
}

export default ApiSupabaseWrapper;
