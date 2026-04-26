import { ISubjectRepo } from "../api/adapters/interfaces";
import {
  CreateSubjectDataParams,
  UpdateSubjectDataParams,
} from "../api/types/subject";

function SubjectService(subjectRepo: ISubjectRepo) {
  async function createSubjectAsync(data: CreateSubjectDataParams) {
    return await subjectRepo.createSubjectAsync(data);
  }

  async function updateSubjectAsync(id: string, data: UpdateSubjectDataParams) {
    return await subjectRepo.updateSubjectAsync(id, data);
  }

  async function getSubjectOfferingsAsync() {
    return await subjectRepo.getSubjectOfferingsAsync();
  }

  return {
    createSubjectAsync,
    updateSubjectAsync,
    getSubjectOfferingsAsync,
  };
}

export default SubjectService;