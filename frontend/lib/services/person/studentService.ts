import { IStudentRepo } from "@/lib/api/adapters/interfaces/people/IStudentRepo";
import {
  UpdateStudentDataParams,
  CreateStudentParams,
} from "../../api/types/person/student";

function StudentService(studentRepo: IStudentRepo) {
  async function getStatusesAsync() {
    return await studentRepo.getStatusesAsync();
  }

  async function createStudentAsync(data: CreateStudentParams) {
    return await studentRepo.createStudentAsync(data);
  }

  async function updateStudentAsync(id: string, data: UpdateStudentDataParams) {
    return await studentRepo.updateStudentAsync(id, data);
  }

  async function getStudentByIdAsync(id: string) {
    return await studentRepo.getStudentByIdAsync(id);
  }

  async function searchStudentsAsync(query: string) {
    return await studentRepo.searchStudentsAsync(query);
  }

  return {
    getStatusesAsync,
    createStudentAsync,
    updateStudentAsync,
    getStudentByIdAsync,
    searchStudentsAsync,
  };
}

export default StudentService;