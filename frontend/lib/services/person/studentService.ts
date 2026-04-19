import {
  UpdateStudentDataParams,
  CreateStudentParams,
} from "../../api/types/person/student";

import SupabaseApiWrapper from "../../api/adapters/supabaseAdapter";
const apiWrapper = new SupabaseApiWrapper();

function studentFunctions() {
  async function getStatusesAsync() {
    return await apiWrapper.getStatusesAsync();
  }

  async function createStudentAsync(data: CreateStudentParams) {
    return await apiWrapper.createStudentAsync(data);
  }

  async function updateStudentAsync(id: string, data: UpdateStudentDataParams) {
    return await apiWrapper.updateStudentAsync(id, data);
  }

  async function getStudentByIdAsync(id: string) {
    return await apiWrapper.getStudentByIdAsync(id);
  }

  return {
    getStatusesAsync,
    createStudentAsync,
    updateStudentAsync,
    getStudentByIdAsync,
  };
}

const studentService = studentFunctions();
export default studentService;
