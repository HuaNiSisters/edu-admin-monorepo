import { createClient } from "./supabase/client";
import { Constants } from "../types/database.types";
import {
  ApiWrapper,
  CreateStudentDataParams,
  CreateStudentDataResponse,
  CreateSubjectDataParams,
  CreateSubjectDataResponse,
  GetGendersResponse,
  GetLocationsResponse,
  GetStatusesResponse,
  GetSubjectOfferingsResponse,
  SubjectOffering,
  UpdateSubjectDataParams,
} from "@/types/IApiWrapper";

class ApiSupabaseWrapper implements ApiWrapper {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }


  async createSubjectAsync(
    data: CreateSubjectDataParams
  ): Promise<CreateSubjectDataResponse> {
      console.log({ createSubjectData: data });
    const { data: responseData } = await this.supabase
      .from("SubjectOffering")
      .insert(data)
      .select()
      .single();
      return responseData;
  }

    async updateSubjectAsync(
    id: string,
    data: UpdateSubjectDataParams,
  ): Promise<SubjectOffering> {
    const { data: responseData } = await this.supabase
      .from("SubjectOffering")
      .update(data)
      .eq("subject_id", id)
      .select()
      .single();
    return responseData;
  }

  async createStudentAsync(
    data: CreateStudentDataParams,
  ): Promise<CreateStudentDataResponse> {
    console.log({ createStudentData: data });
    const { data: responseData } = await this.supabase
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

  async getSubjectOfferingsAsync(): Promise<GetSubjectOfferingsResponse> {
    const { data: responseData, error } = await this.supabase
    .from("SubjectOffering")
    .select("subject_id, subject_name, grade, location, price_per_term, tutorTutor_id")
    .order("grade", { ascending: true });

    if (error) throw error;
    return responseData;
  }
}

export default ApiSupabaseWrapper;
