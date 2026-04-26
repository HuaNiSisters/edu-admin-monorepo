import { IEmployeeRepo } from "@/lib/api/adapters/interfaces";

function EmployeeService(employeeRepo: IEmployeeRepo) {
  async function getTutorsAsync() {
    return await employeeRepo.getTutorsAsync();
  }

  return {
    getTutorsAsync,
  };
}

export default EmployeeService;