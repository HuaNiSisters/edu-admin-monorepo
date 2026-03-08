"use client";

import { SearchStudentsResponse } from "@/types/IApiWrapper";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type StudentRow = SearchStudentsResponse[number];

export const columns: ColumnDef<StudentRow>[] = [
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "contacts",
    header: "Contacts",
    cell: ({ row }) => {
      const { student_mobile, parents } = row.original;
      return (
        <div>
          <div>Student: {student_mobile}</div>
          {parents.map((parent) => (
            <div key={parent.parent_id}>
              {`${parent.first_name}: ${parent.parent_mobile}`}
            </div>
          ))}
        </div>
      );
    },
  },
];
