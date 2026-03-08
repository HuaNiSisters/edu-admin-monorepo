"use client";

import { SubjectOffering } from "@/types/IApiWrapper";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DollarSign, Pencil, ArrowUpDown } from "lucide-react";

export const createSubjectColumns = (
  onEdit: (subject: SubjectOffering) => void,
): ColumnDef<SubjectOffering>[] => [
  {
    accessorKey: "subject_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Subject
        <ArrowUpDown className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="pl-4 font-medium text-foreground">
        {row.getValue("subject_name")}
      </span>
    ),
  },
  {
    accessorKey: "grade",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Grade
        <ArrowUpDown className="ml-2 size-3.5" />
      </Button>
    ),
  },
  {
    accessorKey: "price_per_term",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <DollarSign className="size-3.5 text-muted-foreground" />
        Price
        <ArrowUpDown className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.getValue<number>("price_per_term");
      return (
        <span className="flex items-center gap-1 text-foreground">
          {price.toLocaleString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1 pr-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(row.original)}
          aria-label={`Edit ${row.original.subject_name}`}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    ),
  },
];
