"use client";

import React from "react";
import { useState, useEffect } from "react";
import apiWrapper from "@/lib/services/apiWrapper";
import { useRouter } from "next/navigation";
import { columns } from "./employees-columns";
import { EmployeeInfo } from "@/lib/api/types/IApiWrapper";

import dynamic from "next/dynamic";

const DataTable = dynamic(
  () => import("@/components/ui/data-table").then((m) => m.DataTable),
  { ssr: false },
);

const EmployeesPage = () => {
  const router = useRouter();

  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const fetchedEmployees = await apiWrapper.getTutorsAsync();
      setEmployees(fetchedEmployees);
    };

    fetchEmployees();
  }, []);

  const onClickRow = (classId: string) => {
    router.replace(`/attendance/${classId}`);
  };

  return (
    <div className="py-4">
      <DataTable
        columns={columns}
        data={employees}
        onRowClick={(row) => onClickRow(row.tutor_id)}
      />
    </div>
  );
};

export default EmployeesPage;
