import { ClassTime } from "@/lib/api/types";
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
}

export type {
    IClassRepo,
}