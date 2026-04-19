import { Term } from ".";

type CreateTermDataParams = Omit<Term, "term_id">;
type UpdateTermDataParams = Partial<CreateTermDataParams>;

type GetTermsResponse = Term[];

export type { CreateTermDataParams, UpdateTermDataParams, GetTermsResponse };
