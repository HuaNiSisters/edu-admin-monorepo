import { GetTutorsResponse } from "@/lib/api/types/person/employee";

interface IEmployeeRepo {
  getTutorsAsync: () => Promise<GetTutorsResponse>;
}

export type {
  IEmployeeRepo,
};