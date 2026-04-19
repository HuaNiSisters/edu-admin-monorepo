import { SubjectOffering } from "@/lib/api/types";
import {
  CreateSubjectDataParams,
  UpdateSubjectDataParams,
  GetSubjectOfferingsResponse,
} from "@/lib/api/types/subject";

interface ISubjectRepo {
  createSubjectAsync: (
    data: CreateSubjectDataParams,
  ) => Promise<SubjectOffering>;
  updateSubjectAsync: (
    id: string,
    data: UpdateSubjectDataParams,
  ) => Promise<SubjectOffering>;
  getSubjectOfferingsAsync: () => Promise<GetSubjectOfferingsResponse>;
}

export type { ISubjectRepo };
