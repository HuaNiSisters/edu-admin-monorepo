"use client";

import { SubjectOffering } from "@/types/IApiWrapper";
import { Column, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DollarSign, Pencil, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

export const createSubjectColumns = (
  onEdit: (subject: SubjectOffering) => void,
  subjectOfferings: SubjectOffering[],
): ColumnDef<SubjectOffering>[] => {
  return [
    {
      accessorKey: "subject_name",
      size: 400,
      filterFn: "equalsString",
      header: "Subject",
    },
    {
      accessorKey: "grade",
      size: 220,
      filterFn: (row, columnId, filterValue) =>
        String(row.getValue(columnId)) === filterValue,
      header: "Grade",
      cell: ({ row }) => <span className="pl-3">{row.getValue("grade")}</span>,
    },
    {
      accessorKey: "location",
      header: "Location",
      filterFn: "equalsString",
      cell: ({ row }) => (
        <span>{formatValuesRemoveUnderscores(row.getValue("location"))}</span>
      ),
    },
    {
      accessorKey: "price_per_term",
      size: 120,
      header: () => (
        <div className="flex items-center gap-1 text-base font-medium">
          Price
          <DollarSign className="size-3.5 text-muted-foreground" />
        </div>
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
      size: 80,
      header: () => <div className="text-right pr-3">Actions</div>,
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
};
