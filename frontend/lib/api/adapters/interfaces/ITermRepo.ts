import { Term } from "@/lib/api/types";
import { CreateTermDataParams, UpdateTermDataParams } from "../../types/term";

interface ITermRepo {
  createTermAsync: (data: CreateTermDataParams) => Promise<Term>;
  updateTermAsync: (id: string, data: UpdateTermDataParams) => Promise<Term>;
  getTermsAsync: () => Promise<Term[]>;
}

export type { ITermRepo };
