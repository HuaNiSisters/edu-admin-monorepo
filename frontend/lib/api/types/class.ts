import { ClassTimeWithSubjectAndTutor } from ".";
import { Database } from "../../../types/database.types";

// I think we've asked this before, SHOULD CLASS HAVE A TERM ID????
// I think the reason for no, is because classes stay the same throughout the years,
// and then you want to like just update the grade? and not have to create a new class every time.

type CreateClassDataParams =
  Database["public"]["Tables"]["ClassTime"]["Insert"];

type UpdateClassDataParams = Partial<Omit<CreateClassDataParams, "class_id">>;

type GetClassTimesResponse = ClassTimeWithSubjectAndTutor[];

export type {
  CreateClassDataParams,
  UpdateClassDataParams,
  GetClassTimesResponse,
};
