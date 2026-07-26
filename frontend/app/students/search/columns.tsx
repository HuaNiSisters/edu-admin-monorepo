"use client";

import { SearchStudentsResponse } from "@/lib/api/types/person/student";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type StudentRow = SearchStudentsResponse[number];

export const columns: ColumnDef<StudentRow>[] = [
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-base"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="pl-4">{row.getValue("first_name")}</span>
    ),
    size: 150,
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-base"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    size: 150,
  },
  {
    accessorKey: "contacts",
    header: () => <div className="pr-3">Contacts</div>,
    cell: ({ row }) => {
      const { student_mobile, parents } = row.original;
      return (
        <div className="flex flex-col justify-end gap-1">
          <div>Student: {student_mobile}</div>
          {parents.map((parent) => (
            <div key={parent.parent_id}>
              {`${parent.first_name}: ${parent.parent_mobile}`}
            </div>
          ))}
        </div>
      );
    },
    size: 300,
  },
  {
    accessorKey: "status",
    header: "Status",
    // Convert the boolean row value to "Active"/"Inactive" before matching
    filterFn: (row, columnId, filterValues: string[]) => {
      const label = row.getValue<boolean>(columnId) ? "Active" : "Inactive";
      return filterValues.includes(label);
    },
    cell: ({ row }) => (
      <Badge
        className={row.original.status === "active" ? "default" : "secondary"}
      >
        {row.original.status === "active" ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];
