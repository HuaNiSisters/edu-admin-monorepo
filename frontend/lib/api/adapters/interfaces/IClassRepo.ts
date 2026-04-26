import { ClassTime, ClassTimeWithSubjectAndTutor } from "@/lib/api/types";
import {
  CreateClassDataParams,
  UpdateClassDataParams,
  GetClassTimesResponse,
} from "@/lib/api/types/class";

interface IClassRepo {
  createClassAsync: (data: CreateClassDataParams) => Promise<ClassTime>;
  updateClassAsync: (
    id: string,
    data: UpdateClassDataParams,
  ) => Promise<ClassTime>;
  getClassTimesAsync: () => Promise<GetClassTimesResponse>;
  getClassByIdAsync: (classId: string) => Promise<ClassTimeWithSubjectAndTutor  >;
// ENROL
}

export type {
    IClassRepo,
}