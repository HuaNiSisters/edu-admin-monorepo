import { StudentData } from "@/lib/api/types";

import {
  GetStatusesResponse,
  CreateStudentDataParams,
  UpdateStudentDataParams,
  SearchStudentsResponse,
} from "@/lib/api/types/person/student";

interface IStudentRepo {
  createStudentAsync: (data: CreateStudentDataParams) => Promise<StudentData>;
  updateStudentAsync: (
    id: string,
    data: UpdateStudentDataParams,
  ) => Promise<StudentData>;
  getStudentByIdAsync: (id: string) => Promise<StudentData>;
  searchStudentsAsync: (query: string) => Promise<SearchStudentsResponse>;
  getStatusesAsync: () => Promise<GetStatusesResponse>;
}

export type { IStudentRepo };