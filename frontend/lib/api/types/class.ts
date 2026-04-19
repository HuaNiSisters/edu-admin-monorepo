import { ClassTimeWithSubjectAndTutor } from ".";
import { Database } from "../../../types/database.types";

type CreateClassDataParams =
  Database["public"]["Tables"]["ClassTime"]["Insert"];

type UpdateClassDataParams = Partial<Omit<CreateClassDataParams, "class_id">>;

type GetClassTimesResponse = ClassTimeWithSubjectAndTutor[];

export type {
  CreateClassDataParams,
  UpdateClassDataParams,
  GetClassTimesResponse,
};
