import { createClient } from "../supabase/client";
import { Constants } from "../../../types/database.types";

import {
  ICampusRepo,
  IPersonRepo,
  IStudentRepo,
  IParentRepo,
  IEmployeeRepo,
  ISubjectRepo,
  IClassRepo,
} from "@/lib/api/adapters/interfaces";

import { ClassTime, ParentInfo, StudentInfo, SubjectOffering } from "../types";
import { GetLocationsResponse } from "../types/campus";
import { GetGendersResponse } from "../types/person";
import { GetTutorsResponse } from "../types/person/employee";

import {
  CreateParentDataParams,
  UpdateParentDataParams,
} from "../types/person/parent";

import {
  CreateStudentDataParams,
  GetStatusesResponse,
  SearchStudentsResponse,
  UpdateStudentDataParams,
} from "../types/person/student";

import {
  CreateSubjectDataParams,
  GetSubjectOfferingsResponse,
  UpdateSubjectDataParams,
} from "../types/subject";

import {
  CreateClassDataParams,
  GetClassTimesResponse,
  UpdateClassDataParams,
} from "../types/class";

class SupabaseApiWrapper
  implements
    IPersonRepo,
    IStudentRepo,
    IParentRepo,
    IEmployeeRepo,
    ISubjectRepo,
    IClassRepo,
    ICampusRepo
{
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
        subject_offering: {
          subject_name: string;
          grade: string | null;
          location: string | null;
        } | null;
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

  // ─── Parents ────────────────────────────────────────────────────────────────

  async getParentAsync(parentId: string) {
    const { data: responseData, error } = await this.supabase
      .from("Parent")
      .select()
      .eq("parent_id", parentId)
      .single();

    if (error) throw new Error("Failed to fetch parent: " + error.message);
    return responseData;
  }

  async createParentAsync(data: CreateParentDataParams) {
    console.log({ createParentData: data });
    const { data: responseData, error } = await this.supabase
      .from("Parent")
      .insert(data)
      .select()
      .single();

    if (!!error) {
      throw new Error("Failed to create parent: " + error.message);
    }

    return responseData;
  }

  async updateParentAsync(
    parentId: string,
    parentData: UpdateParentDataParams,
  ) {
    const { data: responseData, error } = await this.supabase
      .from("Parent")
      .update(parentData)
      .eq("parent_id", parentId)
      .select()
      .single();
    return responseData;
  }

  async linkParentToStudentAsync(student_id: string, parent_id: string) {
    const { data: responseData, error } = await this.supabase
      .from("StudentParent")
      .insert({ student_id, parent_id })
      .select()
      .single();

    if (!!error) {
      throw new Error("Failed to link parent to student: " + error.message);
    }

    return responseData;
  }

  // ─── Students ────────────────────────────────────────────────────────────────

  async createStudentAsync(
    data: CreateStudentDataParams,
  ): Promise<StudentInfo> {
    console.log({ createStudentData: data });
    const { data: createStudentResponse, error: createStudentError } =
      await this.supabase.from("Student").insert(data).select().single();
    if (!!createStudentError) {
      throw new Error(
        "Failed to create student: " + createStudentError.message,
      );
    }

    return createStudentResponse;
  }

  async getStudentByIdAsync(
    id: string,
  ): Promise<StudentInfo & { parents: ParentInfo[] }> {
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

    console.log({ getStudentParentData });
    const studentParentDataNormalised = {
      ...getStudentParentData,
      parents: getStudentParentData?.parents?.map((p) => p.Parent) ?? [],
    };
    console.log({ studentParentDataNormalised });
    return studentParentDataNormalised;
  }

  async updateStudentAsync(
    id: string,
    data: UpdateStudentDataParams,
  ): Promise<StudentInfo> {
    const { data: updateStudentResponse, error: updateStudentError } =
      await this.supabase
        .from("Student")
        .update(data.studentData)
        .eq("student_id", id)
        .select()
        .single();

    if (!!updateStudentError) {
      throw new Error(
        "Failed to update student: " + updateStudentError.message,
      );
    }

    console.log({ updateStudentResponse });
    return updateStudentResponse;
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
      .select("tutor_id, first_name, last_name, email, phone")
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

export default SupabaseApiWrapper;
