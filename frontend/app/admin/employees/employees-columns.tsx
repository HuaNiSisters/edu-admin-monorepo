"use client";

import { GetTutorsResponse } from "@/lib/api/types/person/employee";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhoneNumber } from "@/utils/phone-utils";
import Link from "next/link";
import { TutorAccountButton } from "./tutor-account-button";

type TutorRow = GetTutorsResponse[number];

export const columns: ColumnDef<TutorRow>[] = [
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
      <Link
        className="pl-4 hover:underline"
        href={`/admin/employees/${row.original.tutor_id}`}
        onClick={(event) => event.stopPropagation()}
      >
        {row.getValue("first_name")}
      </Link>
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
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-base"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <span className="pl-4">{row.getValue("email")}</span>,
    size: 150,
  },
  {
    accessorKey: "phone",
    header: () => {
      return <span>Phone</span>;
    },
    cell: ({ row }) => (
      <span className="pl-4">
        {formatPhoneNumber(String(row.getValue("phone") ?? ""))}
      </span>
    ),
    size: 150,
  },
];

export function employeeColumns(
  canManageAccounts: boolean,
  onChanged: () => void,
): ColumnDef<TutorRow>[] {
  return [
    ...columns,
    {
      id: "account",
      header: "Account",
      cell: ({ row }) =>
        row.original.auth_user_id ? "Account linked" : "No account",
    },
    ...(canManageAccounts
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
              <div onClick={(event) => event.stopPropagation()}>
                <TutorAccountButton
                  tutor={row.original}
                  onChanged={onChanged}
                />
              </div>
            ),
          } satisfies ColumnDef<TutorRow>,
        ]
      : []),
  ];
}
