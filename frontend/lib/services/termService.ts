import { Term } from "@/lib/api/types";
import { ITermRepo } from "../api/adapters/interfaces/ITermRepo";
import { CreateTermDataParams } from "../api/types/term";

function TermService(termRepo: ITermRepo) {
  async function createTermAsync(data: CreateTermDataParams) {
    return await termRepo.createTermAsync(data);
  }

  async function getTermsAsync() {
    return await termRepo.getTermsAsync();
  }

  return {
    createTermAsync,
    getTermsAsync,
  };
}

export default TermService;
