import Link from "next/link";
import { redirect } from "next/navigation";
import { getActor } from "@/lib/auth/server";
import { UserRole } from "@/core/userRoles/types";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function NewEmployeePage() {
  const { user, role } = await getActor();
  if (!user) redirect("/auth/login");
  if (role !== UserRole.Admin) redirect("/forbidden");
  return (
    <div className="space-y-6">
      <Link href="/admin/employees" className="text-sm underline">
        Back to employees
      </Link>
      <h1 className="text-2xl font-semibold">Add employee</h1>
      <EmployeeForm
        mode="create"
        initial={{ first_name: "", last_name: "", email: "", phone: "" }}
      />
    </div>
  );
}
