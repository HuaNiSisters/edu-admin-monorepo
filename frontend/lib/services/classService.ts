import { IClassRepo } from "../api/adapters/interfaces";
import {
  CreateClassDataParams,
  UpdateClassDataParams,
} from "../api/types/class";

function ClassService(classRepo: IClassRepo) {
  async function createClassAsync(data: CreateClassDataParams) {
    return await classRepo.createClassAsync(data);
  }

  async function updateClassAsync(id: string, data: UpdateClassDataParams) {
    return await classRepo.updateClassAsync(id, data);
  }

  async function getClassTimesAsync() {
    return await classRepo.getClassTimesAsync();
  }

  return {
    createClassAsync,
    updateClassAsync,
    getClassTimesAsync,
  };
}

export default ClassService;