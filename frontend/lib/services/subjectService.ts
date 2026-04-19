import {
  CreateSubjectDataParams,
  UpdateSubjectDataParams,
} from "../api/types/subject";

import SupabaseApiWrapper from "../api/adapters/supabaseAdapter";
const apiWrapper = new SupabaseApiWrapper();

function subjectFunctions() {
  async function createSubjectAsync(data: CreateSubjectDataParams) {
    return await apiWrapper.createSubjectAsync(data);
  }

  async function updateSubjectAsync(id: string, data: UpdateSubjectDataParams) {
    return await apiWrapper.updateSubjectAsync(id, data);
  }

  async function getSubjectOfferingsAsync() {
    return await apiWrapper.getSubjectOfferingsAsync();
  }

  return {
    createSubjectAsync,
    updateSubjectAsync,
    getSubjectOfferingsAsync,
  };
}

const subjectService = subjectFunctions();

export default subjectService;
