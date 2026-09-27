import { IEmployeeRepo } from "@/lib/api/adapters/interfaces";

function EmployeeService(employeeRepo: IEmployeeRepo) {
  async function getEmployeesAsync() {
    return await employeeRepo.getEmployeesAsync();
  }
  async function getTutorsAsync() {
    return await employeeRepo.getTutorsAsync();
  }

  return {
    getEmployeesAsync,
    getTutorsAsync,
  };
}

export default EmployeeService;
