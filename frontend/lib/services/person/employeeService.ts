import { IEmployeeRepo } from "@/lib/api/interfaces";

function EmployeeService(employeeRepo: IEmployeeRepo) {
  async function getTutorsAsync() {
    return await employeeRepo.getTutorsAsync();
  }

  return {
    getTutorsAsync,
  };
}

export default EmployeeService;