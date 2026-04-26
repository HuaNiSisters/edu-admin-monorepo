import { Term } from "@/lib/api/types";
import { ITermRepo } from "../api/adapters/interfaces/ITermRepo";
import { CreateTermDataParams, UpdateTermDataParams } from "../api/types/term";

function TermService(termRepo: ITermRepo) {
  async function createTermAsync(data: CreateTermDataParams) {
    return await termRepo.createTermAsync(data);
  }

  async function updateTermAsync(termId: string, data: UpdateTermDataParams) {
    return await termRepo.updateTermAsync(termId, data);
  }

  async function getTermsAsync() {
    return await termRepo.getTermsAsync();
  }

  return {
    createTermAsync,
    updateTermAsync,
    getTermsAsync,
  };
}

export default TermService;
