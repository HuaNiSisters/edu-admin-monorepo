import { createClient } from "./supabase/client";
import { Constants } from "../types/database.types";
import {
  ApiWrapper,
  StudentData,
  CreateStudentDataParams,
  CreateSubjectDataParams,
  CreateStudentParams,
  UpdateStudentDataParams,
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
    data: CreateSubjectDataParams,
  ): Promise<SubjectOffering> {
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

  async createStudentAsync(data: CreateStudentParams): Promise<StudentData> {
    console.log({ createStudentData: data });
    const { studentData, parent1Data, parent2Data } = data;
    const { data: createStudentResponse, error: createStudentError } =
      await this.supabase.from("Student").insert(studentData).select().single();
    if (!!createStudentError) {
      throw new Error(createStudentError.message);
    }

    const { data: createParent1Response, error: createParent1Error } =
      await this.supabase.from("Parent").insert(parent1Data).select().single();
    if (!!createParent1Error) {
      throw new Error(createParent1Error.message);
    }

    const {
      data: createStudentParent1Response,
      error: createStudentParent1Error,
    } = await this.supabase.from("StudentParent").insert({
      student_id: createStudentResponse?.student_id,
      parent_id: createParent1Response?.parent_id,
    });
    if (!!createStudentParent1Error) {
      throw new Error(createStudentParent1Error.message);
    }

    if (!!parent2Data?.first_name) {
      const { data: createParent2Response, error: createParent2Error } =
        await this.supabase
          .from("Parent")
          .insert(parent2Data)
          .select()
          .single();
      if (!!createParent2Error) {
        throw new Error(createParent2Error.message);
      }

      const {
        data: createStudentParent2Response,
        error: createStudentParent2Error,
      } = await this.supabase.from("StudentParent").insert({
        student_id: createStudentResponse?.student_id,
        parent_id: createParent2Response?.parent_id,
      });
      if (!!createStudentParent2Error) {
        throw new Error(createStudentParent2Error.message);
      }
    }

    return {
      ...createStudentResponse,
      parent1FullName: parent1Data.first_name,
      parent1Mobile: parent1Data.parent_mobile,
      parent2FullName: parent2Data?.first_name,
      parent2Mobile: parent2Data?.parent_mobile,
    };
  }

  async getStudentByIdAsync(id: string): Promise<StudentData> {
    const { data: getStudentParentData, error: getStudentParentError } =
      await this.supabase
        .from("Student")
        .select(
          `
        *,
        parents:StudentParent (
          relationship,
          Parent (
            parent_id,
            first_name,
            parent_mobile
          )
        )
      `,
        )
        .eq("student_id", id)
        .single();
    console.log({ getStudentParentData, getStudentParentError });
    if (!!getStudentParentError) {
      throw new Error(getStudentParentError.message);
    }
    const parents = getStudentParentData?.parents || [];
    delete getStudentParentData?.parents;

    return {
      ...getStudentParentData,
      // TODO: CHECK ORDERING OF PARENTS, may need a 'primary' contact flag field
      parent1Id: parents[0]?.Parent.parent_id,
      parent1FullName: parents[0]?.Parent.first_name,
      parent1Mobile: parents[0]?.Parent.parent_mobile,
      parent2Id: parents[1]?.Parent.parent_id,
      parent2FullName: parents[1]?.Parent.first_name,
      parent2Mobile: parents[1]?.Parent.parent_mobile,
    };
  }

  async updateStudentAsync(
    id: string,
    data: UpdateStudentDataParams,
  ): Promise<StudentData> {
    const { data: updateStudentResponse, error: updateStudentError } =
      await this.supabase
        .from("Student")
        .update(data.studentData)
        .eq("student_id", id)
        .select()
        .single();

    if (!!updateStudentError) {
      throw new Error(updateStudentError.message);
    }

    const { data: updateParent1Response, error: updateParent1Error } =
      await this.supabase
        .from("Parent")
        .update(data.parent1Data)
        .eq("parent_id", data.parent1Data?.parent_id)
        .select()
        .single();

    if (!!updateParent1Error) {
      throw new Error(updateParent1Error.message);
    }

    const { data: updateParent2Response, error: updateParent2Error } =
      await this.supabase
        .from("Parent")
        .update(data.parent2Data)
        .eq("parent_id", data.parent2Data?.parent_id)
        .select()
        .single();

    if (!!updateParent2Error) {
      throw new Error(updateParent2Error.message);
    }

    const responseData = {
      ...updateStudentResponse,
      parent1Id: data.parent1Data?.parent_id,
      parent1FullName: updateParent1Response?.first_name,
      parent1Mobile: updateParent1Response?.parent_mobile,
      parent2Id: data.parent2Data?.parent_id,
      parent2FullName: updateParent2Response?.first_name,
      parent2Mobile: updateParent2Response?.parent_mobile,
    };
    console.log({ responseData });
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
      .select(
        "subject_id, subject_name, grade, location, price_per_term, tutorTutor_id",
      )
      .order("grade", { ascending: true });

    if (error) throw error;
    return responseData;
  }
}

export default ApiSupabaseWrapper;
