import { Database } from "../../../types/database.types";
import { SubjectOffering } from "./IApiWrapper";

type CreateSubjectDataParams =
  Database["public"]["Tables"]["SubjectOffering"]["Insert"];
type UpdateSubjectDataParams = Partial<
  Omit<CreateSubjectDataParams, "subject_id">
>;

type GetSubjectOfferingsResponse = SubjectOffering[];

export type {
  CreateSubjectDataParams,
  UpdateSubjectDataParams,
  GetSubjectOfferingsResponse,
};
