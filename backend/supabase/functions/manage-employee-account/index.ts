import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store, private",
};

function reply(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function temporaryPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const base64 = btoa(String.fromCharCode(...bytes));
  return `${base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")}Aa1!`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization) return reply({ error: "Please sign in." }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) {
    return reply({ error: "Employee account management is not configured." }, 503);
  }

  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await callerClient.auth.getUser();
  if (authError || !authData.user) return reply({ error: "Please sign in." }, 401);
  if (authData.user.app_metadata?.role !== "admin") {
    return reply({ error: "Only admins can manage employee accounts." }, 403);
  }

  const body = await request.json().catch(() => null);
  const tutorId = body?.tutorId;
  const reset = body?.reset;
  if (typeof tutorId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tutorId) ||
      typeof reset !== "boolean") {
    return reply({ error: "Invalid employee account request." }, 400);
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: details, error: detailsError } = await admin.from("TutorDetails")
    .select("job").eq("tutor_id", tutorId).maybeSingle();
  if (detailsError) {
    return reply({ error: "Could not read the employee role. Check the employee-role migration." }, 503);
  }
  const role = details?.job ?? "tutor";
  if (role !== "admin" && role !== "reception" && role !== "tutor") {
    return reply({ error: "Select a valid employee role before managing their account." }, 409);
  }

  const password = temporaryPassword();
  let email: string;
  if (reset) {
    const { data: tutor, error: tutorError } = await admin.from("Tutor")
      .select("auth_user_id, email").eq("tutor_id", tutorId).maybeSingle();
    if (tutorError || !tutor?.auth_user_id) {
      return reply({ error: "No linked employee account was found." }, 404);
    }
    const { data: linkedAccount, error: linkedAccountError } = await admin.auth.admin.getUserById(tutor.auth_user_id);
    if (linkedAccountError || linkedAccount.user?.app_metadata?.role !== role ||
        !linkedAccount.user.email || linkedAccount.user.email.toLowerCase() !== tutor.email?.trim().toLowerCase()) {
      return reply({ error: "The linked account does not match this employee. Ask an administrator to review it." }, 409);
    }
    email = linkedAccount.user.email;
    const { error } = await admin.auth.admin.updateUserById(tutor.auth_user_id, {
      password,
      email_confirm: true,
    });
    if (error) {
      return reply({ error: "Could not reset the password. Check the Supabase password policy and try again." }, 502);
    }
  } else {
    const { data, error } = await admin.rpc("prepare_tutor_account", { target_tutor_id: tutorId });
    if (error) {
      return reply({
        error: error.code === "P0001" ? error.message : "Could not prepare the account. Check the database migration.",
      }, 409);
    }
    email = data;
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role, tutor_id: tutorId },
    });
    if (createError) {
      return reply({
        error: "Could not create the account. Refresh the employee list before retrying: the email may already have an account. Also check the database migration and Supabase password policy.",
      }, 409);
    }
  }

  return reply({ email, temporaryPassword: password });
});
