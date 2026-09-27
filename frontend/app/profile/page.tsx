import { redirect } from "next/navigation";
import { getActor } from "@/lib/auth/server";
import Link from "next/link";
import { EmployeeForm } from "@/components/employees/employee-form";
import {
  EMPLOYEE_DETAIL_COLUMNS,
  EMPLOYEE_SUMMARY_COLUMNS,
  type EmployeeRecord,
} from "@/lib/employees/schema";

export default async function ProfilePage() {
  const { supabase, user, role } = await getActor();
  if (!user) redirect("/auth/login");
  if (!role) redirect("/forbidden");
  const { data, error } = await supabase
    .from("Tutor")
    .select(EMPLOYEE_SUMMARY_COLUMNS)
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (error)
    return (
      <p role="alert">Your profile is unavailable. Please reload the page.</p>
    );
  if (!data)
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">My account</h1>
        <p>This account is not linked to an employee record.</p>
        <Link href="/auth/update-password" className="underline">
          Change password
        </Link>
      </div>
    );
  const { data: details, error: detailsError } = await supabase
    .from("TutorDetails")
    .select(EMPLOYEE_DETAIL_COLUMNS)
    .eq("tutor_id", data.tutor_id)
    .maybeSingle();
  if (detailsError)
    return (
      <p role="alert">
        Your employee details are unavailable. Ask your administrator to check
        the employee-details migration.
      </p>
    );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My profile</h1>
      <EmployeeForm
        initial={{ ...details, ...data } as EmployeeRecord}
        mode="self"
      />
    </div>
  );
}
