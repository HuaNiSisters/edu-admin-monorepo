import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getActor } from "@/lib/auth/server";
import { UserRole } from "@/core/userRoles/types";
import { EmployeeForm } from "@/components/employees/employee-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatPhoneNumber } from "@/utils/phone-utils";
import {
  EMPLOYEE_DETAIL_COLUMNS,
  EMPLOYEE_SUMMARY_COLUMNS,
  type EmployeeRecord,
} from "@/lib/employees/schema";

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ tutorId: string }>;
}) {
  const { supabase, user, role } = await getActor();
  if (!user) redirect("/auth/login");
  if (role !== UserRole.Admin && role !== UserRole.Receptionist)
    redirect("/forbidden");
  const { tutorId } = await params;
  if (!z.string().uuid().safeParse(tutorId).success) notFound();
  const { data: tutor, error } = await supabase
    .from("Tutor")
    .select(EMPLOYEE_SUMMARY_COLUMNS)
    .eq("tutor_id", tutorId)
    .maybeSingle();
  if (error)
    return (
      <p role="alert">Could not load this employee. Please reload the page.</p>
    );
  if (!tutor) notFound();

  if (role === UserRole.Receptionist) {
    return (
      <div className="space-y-4">
        <Link href="/admin/employees" className="text-sm underline">
          Back to employees
        </Link>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { id: "first_name", label: "First name", value: tutor.first_name },
            { id: "last_name", label: "Last name", value: tutor.last_name },
            { id: "email", label: "Email", value: tutor.email },
            {
              id: "phone",
              label: "Mobile",
              value: formatPhoneNumber(tutor.phone),
            },
          ].map((field) => (
            <Field key={field.id}>
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              <Input
                id={field.id}
                value={field.value ?? ""}
                disabled
                readOnly
              />
            </Field>
          ))}
        </div>
      </div>
    );
  }
  const { data: details, error: detailsError } = await supabase
    .from("TutorDetails")
    .select(EMPLOYEE_DETAIL_COLUMNS)
    .eq("tutor_id", tutorId)
    .maybeSingle();
  if (detailsError)
    return (
      <p role="alert">
        Could not load employee details. Check that the employee-details
        migration has been applied, then reload.
      </p>
    );
  const employee = { ...details, ...tutor } as EmployeeRecord;
  return (
    <div className="space-y-6">
      <Link href="/admin/employees" className="text-sm underline">
        Back to employees
      </Link>
      <EmployeeForm initial={employee} mode="admin" />
    </div>
  );
}
