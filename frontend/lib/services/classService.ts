import {
  CreateClassDataParams,
  UpdateClassDataParams,
} from "../api/types/class";

import SupabaseApiWrapper from "../api/adapters/supabaseAdapter";
const apiWrapper = new SupabaseApiWrapper();

function classFunctions() {
  async function createClassAsync(data: CreateClassDataParams) {
    return await apiWrapper.createClassAsync(data);
  }

  async function updateClassAsync(id: string, data: UpdateClassDataParams) {
    return await apiWrapper.updateClassAsync(id, data);
  }

  async function getClassTimesAsync() {
    return await apiWrapper.getClassTimesAsync();
  }

  async function getLocationsAsync() {
    return await apiWrapper.getLocationsAsync();
  }

  return {
    createClassAsync,
    updateClassAsync,
    getClassTimesAsync,
    getLocationsAsync,
  };
}

const classService = classFunctions();
export default classService;
