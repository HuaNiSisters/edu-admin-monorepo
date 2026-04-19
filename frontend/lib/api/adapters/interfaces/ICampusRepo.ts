import { GetLocationsResponse } from "@/lib/api/types/campus";

interface ICampusRepo {
  getLocationsAsync: () => Promise<GetLocationsResponse>;
}

export type {
  ICampusRepo,
};