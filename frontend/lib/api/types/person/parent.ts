import { Database } from "@/types/database.types";

type CreateParentDataParams = Database["public"]["Tables"]["Parent"]["Insert"];
type UpdateParentDataParams = Partial<Omit<CreateParentDataParams, "parent_id">>;

export type { CreateParentDataParams, UpdateParentDataParams };
