import { GetTutorsResponse } from "@/lib/api/types/person/employee";

interface IEmployeeRepo {
  getEmployeesAsync: () => Promise<GetTutorsResponse>;
  getTutorsAsync: () => Promise<GetTutorsResponse>;
}

export type {
  IEmployeeRepo,
};
