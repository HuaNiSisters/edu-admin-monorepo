import { ParentInfo, StudentInfo } from "@/lib/api/types";

import {
  GetStatusesResponse,
  CreateStudentDataParams,
  UpdateStudentDataParams,
  SearchStudentsResponse,
} from "@/lib/api/types/person/student";

interface IStudentRepo {
  createStudentAsync: (data: CreateStudentDataParams) => Promise<StudentInfo>;
  updateStudentAsync: (
    id: string,
    data: UpdateStudentDataParams,
  ) => Promise<StudentInfo>;
  getStudentByIdAsync: (id: string) => Promise<StudentInfo & { parents: ParentInfo[] }>;
  searchStudentsAsync: (query: string) => Promise<SearchStudentsResponse>;
  getStatusesAsync: () => Promise<GetStatusesResponse>;
}

export type { IStudentRepo };