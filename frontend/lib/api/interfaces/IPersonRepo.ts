import { GetGendersResponse } from "@/lib/api/types/person";

interface IPersonRepo {
  getGendersAsync: () => Promise<GetGendersResponse>;
}

export type {
  IPersonRepo,
};