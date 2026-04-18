import { createClient } from "./supabase/client";
import { Constants } from "../types/database.types";
import {
  ApiWrapper,
  StudentData,
  CreateSubjectDataParams,
  CreateStudentParams,
  UpdateStudentDataParams,
  GetGendersResponse,
  GetLocationsResponse,
  GetStatusesResponse,
  GetSubjectOfferingsResponse,
  SubjectOffering,
  UpdateSubjectDataParams,
  SearchStudentsResponse,
  ParentInfo,
  ClassTime,
  CreateClassDataParams,
  UpdateClassDataParams,
  GetClassTimesResponse,
  GetTutorsResponse,
} from "@/types/IApiWrapper";

class ApiSupabaseWrapper implements ApiWrapper {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  // ─── Subjects ────────────────────────────────────────────────────────────────

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

  async getSubjectOfferingsAsync(): Promise<GetSubjectOfferingsResponse> {
    const { data: responseData, error } = await this.supabase
      .from("SubjectOffering")
      .select(
        "subject_id, subject_name, grade, location, price_per_term, tutorTutor_id",
      )
      .order("subject_name", { ascending: true });

    if (error) throw error;
    return responseData;
  }

  // ─── Classes ─────────────────────────────────────────────────────────────────

  async createClassAsync(data: CreateClassDataParams): Promise<ClassTime> {
    console.log({ createClassData: data });
    const { data: responseData, error } = await this.supabase
      .from("ClassTime")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error("Failed to create class: " + error.message);
    return responseData;
  }

  async updateClassAsync(
    id: string,
    data: UpdateClassDataParams,
  ): Promise<ClassTime> {
    const { data: responseData, error } = await this.supabase
      .from("ClassTime")
      .update(data)
      .eq("class_id", id)
      .select()
      .single();

    if (error) throw new Error("Failed to update class: " + error.message);
    return responseData;
  }

async getClassTimesAsync(): Promise<GetClassTimesResponse> {
  const { data: responseData, error } = await this.supabase
    .from("ClassTime")
    .select(
      `
      *,
      subject_offering:SubjectOffering (
        subject_name,
        grade,
        location
      ),
      tutor:Tutor (
        first_name,
        last_name
      )
    `,
    )
    .order("day_of_week", { ascending: true });

  if (error) throw new Error("Failed to fetch classes: " + error.message);

  return (responseData ?? []).map((row) => {
    const { subject_offering, tutor, ...rest } = row as typeof row & {
      subject_offering: { subject_name: string; grade: string | null; location: string | null } | null;
      tutor: { first_name: string; last_name: string } | null;
    };
    return {
      ...rest,
      subject_name: subject_offering?.subject_name,
      grade: subject_offering?.grade,
      location: subject_offering?.location,
      tutor: tutor ? `${tutor.first_name} ${tutor.last_name}` : null,
    };
  });
}

  // ─── Students ────────────────────────────────────────────────────────────────

  async createStudentAsync(data: CreateStudentParams): Promise<StudentData> {
    console.log({ createStudentData: data });
    const { studentData, parent1Data, parent2Data } = data;
    const { data: createStudentResponse, error: createStudentError } =
      await this.supabase.from("Student").insert(studentData).select().single();
    if (!!createStudentError) {
      throw new Error("Failed to create student: " + createStudentError.message);
    }

    const { data: createParent1Response, error: createParent1Error } =
      await this.supabase.from("Parent").insert({
        first_name: parent1Data.first_name,
        last_name: parent1Data.last_name,
        parent_mobile: parent1Data.parent_mobile,
      }).select().single();
    if (!!createParent1Error) {
      throw new Error("Failed to create parent 1: " + createParent1Error.message);
    }

    const {
      error: createStudentParent1Error,
    } = await this.supabase.from("StudentParent").insert({
      student_id: createStudentResponse?.student_id,
      parent_id: createParent1Response?.parent_id,
    });
    if (!!createStudentParent1Error) {
      throw new Error("Failed to create student-parent relationship for parent 1: " + createStudentParent1Error.message);
    }

    if (!!parent2Data?.first_name) {
      const { data: createParent2Response, error: createParent2Error } =
        await this.supabase
          .from("Parent")
          .insert({
            first_name: parent2Data.first_name,
            last_name: parent2Data.last_name,
            parent_mobile: parent2Data.parent_mobile,
          })
          .select()
          .single();
      if (!!createParent2Error) {
        throw new Error("Failed to create parent 2: " + createParent2Error.message);
      }

      const { error: createStudentParent2Error } =
        await this.supabase.from("StudentParent").insert({
          student_id: createStudentResponse?.student_id,
          parent_id: createParent2Response?.parent_id,
        });
      if (!!createStudentParent2Error) {
        throw new Error("Failed to create student-parent relationship for parent 2: " + createStudentParent2Error.message);
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
      throw new Error("Failed to update student: " + updateStudentError.message);
    }

    const { data: updateParent1Response, error: updateParent1Error } =
      await this.supabase
        .from("Parent")
        .update(data.parent1Data)
        .eq("parent_id", data.parent1Data?.parent_id)
        .select()
        .single();

    if (!!updateParent1Error) {
      throw new Error("Failed to update parent 1: " + updateParent1Error.message);
    }

    let parent2Data: ParentInfo;
    // REPEITIVE CODE: TO REFACTOR
    if (!data.parent2Data?.parent_id) {
      const { data: createParent2Response, error: createParent2Error } =
        await this.supabase
          .from("Parent")
          .insert({
            first_name: data.parent2Data?.first_name,
            last_name: data.parent2Data?.last_name,
            parent_mobile: data.parent2Data?.parent_mobile,
          })
          .select()
          .single();
      await this.supabase.from("StudentParent").insert({
        student_id: id,
        parent_id: createParent2Response?.parent_id,
      });
      if (!!createParent2Error) {
        throw new Error("Failed to create parent 2: " + createParent2Error.message);
      }
      parent2Data = createParent2Response;
    } else {
      const { data: updateParent2Response, error: updateParent2Error } =
        await this.supabase
          .from("Parent")
          .update(data.parent2Data)
          .eq("parent_id", data.parent2Data?.parent_id)
          .select()
          .single();
      if (!!updateParent2Error) {
        throw new Error("Failed to update parent 2: " + updateParent2Error.message);
      }
      parent2Data = updateParent2Response;
    }

    const responseData = {
      ...updateStudentResponse,
      parent1Id: data.parent1Data?.parent_id,
      parent1FullName: updateParent1Response?.first_name,
      parent1Mobile: updateParent1Response?.parent_mobile,
      parent2Id: data.parent2Data?.parent_id,
      parent2FullName: parent2Data?.first_name,
      parent2Mobile: parent2Data?.parent_mobile,
    };
    console.log({ responseData });
    return responseData;
  }

  async searchStudentsAsync(query: string): Promise<SearchStudentsResponse> {
    const { data: searchStudentsResult, error: searchStudentsError } =
      await this.supabase.rpc("search_students", { search_query: query });

    if (searchStudentsError) {
      throw new Error(searchStudentsError.message);
    }

    return searchStudentsResult;
  }

  // --- Tutors (Employees) ---
  async getTutorsAsync(): Promise<GetTutorsResponse> {
    const { data: responseData, error } = await this.supabase
      .from("Tutor")
      .select(
        "tutor_id, first_name, last_name, email, phone",
      )
      .order("first_name", { ascending: true });

    if (error) throw error;
    return responseData;
  }

  // ─── Lookups ─────────────────────────────────────────────────────────────────

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