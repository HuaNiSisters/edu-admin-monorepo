"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/core/userRoles/types";
import { getActor } from "@/lib/auth/server";

export async function closeFollowUps(followUpIds: number[]): Promise<string | null> {
  const { role, supabase } = await getActor();
  if (role !== UserRole.Admin && role !== UserRole.Receptionist) {
    return "You do not have permission to complete follow-ups.";
  }

  if (!Array.isArray(followUpIds) || followUpIds.length === 0 ||
      followUpIds.some((id) => !Number.isSafeInteger(id) || id < 1 || id > 2147483647)) {
    return "Select valid follow-ups to close.";
  }

  const { error } = await supabase
    .from("PaymentFollowUp")
    .update({ is_completed: true })
    .in("follow_up_id", followUpIds)
    .eq("is_completed", false);

  if (error) return "Unable to close the selected follow-ups. Please try again.";

  revalidatePath("/students/follow-up");
  return null;
}
