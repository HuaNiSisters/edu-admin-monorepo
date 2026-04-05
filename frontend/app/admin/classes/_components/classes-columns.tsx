"use client";

import { ClassTimeWithSubject } from "@/types/IApiWrapper";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const formatTime = (time: string) => {
  if (!time) return "—";
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
};

export const createClassColumns = (
  onEdit: (classTime: ClassTimeWithSubject) => void,
): ColumnDef<ClassTimeWithSubject>[] => [
  {
    accessorKey: "day_of_week",
    size: 100,
    header: "Day",
    sortingFn: (a, b) =>
      DAY_ORDER.indexOf(a.original.day_of_week) -
      DAY_ORDER.indexOf(b.original.day_of_week),
    filterFn: "equalsString",
    cell: ({ row }) => <span>{row.getValue("day_of_week")}</span>,
  },
  {
    accessorKey: "grade",
    size: 50,
    header: "Grade",
    filterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId)) === filterValue,
    cell: ({ row }) => {
      const grade = row.getValue("grade");
      return <span>{grade ? `${grade}` : "—"}</span>;
    },
  },
  {
    accessorKey: "subject_name",
    size: 200,
    header: "Subject",
    filterFn: "equalsString",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("subject_name") ?? "—"}</span>
    ),
  },
  {
    accessorKey: "start_time",
    size: 200,
    header: "Time",
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const rowTime = row.getValue<string>(columnId);
      if (!rowTime) return false;

      // Compare only HH:mm
      return rowTime.startsWith(filterValue);
    },
    cell: ({ row }) => (
      <span>
        {formatTime(row.getValue("start_time"))} –{" "}
        {formatTime(row.original.end_time)}
      </span>
    ),
  },
  {
    accessorKey: "location",
    size: 200,
    header: "Location",
    filterFn: "equalsString",
    cell: ({ row }) => (
      <span>
        {formatValuesRemoveUnderscores(row.getValue("location")) ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    // Convert the boolean row value to "Active"/"Inactive" before matching
    filterFn: (row, columnId, filterValues: string[]) => {
      const label = row.getValue<boolean>(columnId) ? "Active" : "Inactive";
      return filterValues.includes(label);
    },
    cell: ({ row }) => (
      <Badge className={row.original.active ? "default" : "secondary"}>
        {row.original.active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-3">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end pr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(row.original)}
          aria-label="Edit class"
        >
          <Pencil className="size-4" />
        </Button>
      </div>
    ),
  },
];
