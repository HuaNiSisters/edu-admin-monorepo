import "server-only";
import { createClient } from "@/lib/api/supabase/server";
import { getRole } from "@/core/userRoles/access";

export async function getActor() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user, role: error ? null : getRole(user?.app_metadata) };
}

export function siteUrl() {
  const configured = process.env.APP_URL;
  if (!configured) throw new Error("Set APP_URL to the application's public origin.");
  const url = new URL(configured);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("APP_URL must be an HTTP(S) origin.");
  }
  return url.origin;
}
