import { Database } from "../../../../types/database.types";
import { ParentInfo, StudentInfo, StudentStatus } from "..";
import { CreateParentDataParams } from "./parent";

type GetStatusesResponse = StudentStatus[];

type CreateStudentDataParams =
  Database["public"]["Tables"]["Student"]["Insert"];
type CreateStudentParams = {
  studentData: CreateStudentDataParams;
  parent1Data: CreateParentDataParams;
  parent2Data?: CreateParentDataParams;
};

type UpdateStudentDataParams = {
  studentData: Partial<Omit<CreateStudentDataParams, "student_id">>;
  parent1Data: Partial<CreateParentDataParams>;
  parent2Data?: Partial<CreateParentDataParams>;
};

type SearchStudentsResponse = {
  student_id: StudentInfo["student_id"];
  first_name: StudentInfo["first_name"];
  last_name: StudentInfo["last_name"];
  email: StudentInfo["email"];
  student_mobile: StudentInfo["student_mobile"];
  parents: {
    parent_id: ParentInfo["parent_id"];
    first_name: ParentInfo["first_name"];
    parent_mobile: ParentInfo["parent_mobile"];
  }[];
}[];

export type {
  GetStatusesResponse,
  CreateStudentDataParams,
  // CreateParentDataParams,
  CreateStudentParams,
  UpdateStudentDataParams,
  SearchStudentsResponse,
};
