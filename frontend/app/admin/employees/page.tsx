"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useMemo } from "react";
import { employeeService } from "@/lib/services";
import { useAuth } from "@/hooks/use-auth";
import { employeeColumns } from "./employees-columns";
import { EmployeeInfo } from "@/lib/api/types";
import { EmployeeDialog } from "./employee-dialog";

import { DataTable } from "@/components/ui/data-table";
import { LoadingBar } from "@/components/loading-bar";
import { Plus } from "lucide-react";

const EmployeesPage = () => {
  const { isUserAdmin } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEmployees(await employeeService.getEmployeesAsync());
    } catch {
      setError("Could not load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);
  const canManageAccounts = isUserAdmin();
  const columns = useMemo(
    () =>
      employeeColumns(canManageAccounts, () => {
        void fetchEmployees();
      }),
    [canManageAccounts, fetchEmployees],
  );

  return (
    <div className="py-4">
      <LoadingBar isLoading={loading} />
      <div className="flex items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-semibold">Employees</h1>
        {isUserAdmin() && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Add employee
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-destructive mb-4">
          {error}{" "}
          <button className="underline" onClick={fetchEmployees}>
            Retry
          </button>
        </p>
      )}
      <DataTable
        columns={columns}
        data={employees}
        onRowClick={(employee) =>
          router.push(`/admin/employees/${employee.tutor_id}`)
        }
      />
      {isUserAdmin() && (
        <EmployeeDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={() => {
            void fetchEmployees();
          }}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
