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
  ITermRepo,
  IEnrolmentRepo,
} from "@/lib/api/adapters/interfaces";

import {
  AttendanceStatus,
  ClassTime,
  ParentInfo,
  StudentInfo,
  SubjectOffering,
  Term,
} from "../types";
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

import { CreateTermDataParams, GetTermsResponse, UpdateTermDataParams } from "../types/term";

import { CreateEnrolmentDataParams } from "../types/enrolment";

class SupabaseApiWrapper
  implements
    IPersonRepo,
    IStudentRepo,
    IParentRepo,
    IEmployeeRepo,
    ISubjectRepo,
    ITermRepo,
    IClassRepo,
    IEnrolmentRepo,
    ICampusRepo
{
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient();
  }

  private async generateAttendance(
    studentId: string,
    classId: string,
    termId: string
  ) {
    const attendanceRows = Array.from({ length: 10 }, (_, i) => ({
      student_id: studentId,
      class_id: classId,
      term_id: termId,
      week: i + 1,
      status: "absent" as AttendanceStatus,
    }));

    const { error } = await this.supabase
      .from("Attendance")
      .upsert(attendanceRows);

    if (error) {
      throw new Error("Failed to generate attendance: " + error.message);
    }
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

async getClassByIdAsync(classId: string) {
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
    .eq("class_id", classId)
    .single();

  if (error) throw new Error("Failed to fetch class: " + error.message);

  const { subject_offering, tutor, ...rest } = responseData as typeof responseData & {
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
}

async getAttendanceByStudentAndClassAndTermAsync(studentId: string, classId: string, termId: string) {
  const { data, error } = await this.supabase
    .from("Attendance")
    .select("attendance_id, student_id, class_id, term_id, week, status, notes")
    .eq("student_id", studentId)
    .eq("class_id", classId)
    .eq("term_id", termId)
    .order("week", { ascending: true });

  if (error) throw new Error("Failed to fetch attendance: " + error.message);
  return data ?? [];
}

async updateStudentAttendanceInClassAndTermPerWeekAsync(studentId: string, classId: string, termId: string, week: number, attendanceStatus: AttendanceStatus ) {
  const { error } = await this.supabase
      .from("Attendance")
      .update({ status: attendanceStatus })
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .eq("term_id", termId)
      .eq("week", week)

  if (error) {
    throw new Error("Failed to update attendance: " + error.message);
  }
}

async getEnrolmentsWithAttendanceByClassAndTermAsync(classId: string, termId: string) {
  const { data, error } = await this.supabase
    .from("Enrolment")
    .select(`
      student_id,
      Student (
        student_id,
        first_name,
        last_name,
        gender
      )
    `)
    .eq("class_id", classId);

  if (error) throw new Error("Failed to fetch enrolments with attendance: " + error.message);

  const rows = await Promise.all(
    (data ?? []).map(async (row) => {
      const student = row.Student as unknown as {
        student_id: string;
        first_name: string;
        last_name: string;
        gender: string | null;
      };

      const { data: attendanceData, error: attendanceError } = await this.supabase
        .from("Attendance")
        .select("attendance_id, week, status, notes, term_id, class_id, student_id")
        .eq("student_id", student.student_id)
        .eq("class_id", classId)
        .eq("term_id", termId)
        .order("week", { ascending: true });

      if (attendanceError) throw new Error("Failed to fetch attendance: " + attendanceError.message);

      return {
        studentId: student.student_id,
        firstName: student.first_name,
        lastName: student.last_name,
        gender: student.gender,
        attendanceRecords: attendanceData ?? [],
      };
    })
  );

  // Dedupe by studentId
  return rows.filter((r, i, self) => i === self.findIndex((s) => s.studentId === r.studentId));
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

  // --- Terms --------------------------------------
  async getTermsAsync(): Promise<GetTermsResponse> {
    const { data: responseData, error } = await this.supabase
      .from("Term")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) throw error;
    return responseData;
  }

  async createTermAsync(data: CreateTermDataParams): Promise<Term> {
    console.log({ createTermData: data });
    const { data: responseData, error } = await this.supabase
      .from("Term")
      .insert(data)
      .select()
      .single();
    // console.log({ createTermResponse: responseData, createTermError: error });
    if (error) throw new Error("Failed to create term: " + error.message);
    return responseData;
  }

  async updateTermAsync(termId: string, data: UpdateTermDataParams): Promise<Term> {
    const { data: responseData, error } = await this.supabase
      .from("Term")
      .update(data)
      .eq("term_id", termId)
      .select()
      .single();
    if (error) throw new Error("Failed to update term: " + error.message);
    return responseData;
  }

  /**
   * Enrolments
   */
  async createEnrolmentAsync(data: CreateEnrolmentDataParams) {
    const { student_id, class_id, term_id, enrolment_date, status } = data;

    const { data: responseData, error } = await this.supabase
      .from("Enrolment")
      .insert({
        student_id,
        class_id,
        term_id,
        enrolment_date,
        status,
      })
      .select()
      .single();

    if (error) throw new Error("Failed to create enrolment: " + error.message);

    // TODO: to generate attendance for future terms, assuming student remains enrolled
    // 1. Get current term
    // 2. Generate for CURRENT term
    await this.generateAttendance(student_id, class_id, term_id);

    // 3. Find FUTURE terms
    // 4. Only create attendance if enrolment exists

    return responseData;
  }

  async getEnrolmentsByStudentIdAsync(studentId: string) {
    const { data: responseData, error } = await this.supabase
      .from("Enrolment")
      .select("*, Term(*), ClassTime(*, SubjectOffering(*))")
      .eq("student_id", studentId);
    if (error) throw new Error("Failed to fetch enrolments: " + error.message);
    return responseData;
  }

  async getEnrolmentsByClassIdAsync(classId: string) {
    const { data: responseData, error } = await this.supabase
      .from("Enrolment")
      .select("*")
      .eq("class_id", classId);
    if (error) throw new Error("Failed to fetch enrolments: " + error.message);
    return responseData;
  }

  // async updateEnrolmentAsync(
  //   id: string,
  //   data: Omit<
  //     CreateEnrolmentDataParams,
  //     "student_id" | "class_id" | "term_id"
  //   >,
  // ) {
  //   const { enrolment_date, status } = data;
  //   const { data: responseData, error } = await this.supabase
  //     .from("Enrolment")
  //     .update({
  //       enrolment_date,
  //       status,
  //     })
  //     .eq("enrolment_id", id)
  //     .select()
  //     .single();
  //   if (error) throw new Error("Failed to update enrolment: " + error.message);
  //   return responseData;
  // }
}

export default SupabaseApiWrapper;
