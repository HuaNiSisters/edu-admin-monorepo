import { CreateParentDataParams } from "@/lib/api/types/IApiWrapper";

interface GetParentResponse {
  email?: string;
  first_name: string;
  last_name?: string;
  notes?: string | null;
  parent_id: string;
  parent_mobile: string;
}

interface IParentRepo {
  createParentAsync: (
    parentData: CreateParentDataParams,
  ) => Promise<GetParentResponse>;

  updateParentAsync: (
    parentId: string,
    parentData: CreateParentDataParams,
  ) => Promise<GetParentResponse>;

  linkParentToStudentAsync: (
    parentId: string,
    studentId: string,
  ) => Promise<void>;
}

export type { IParentRepo };
