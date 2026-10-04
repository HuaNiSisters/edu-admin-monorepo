"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Enquiry } from "@/lib/api/types/enquiry";

function column(
  key: keyof Enquiry,
  label: string,
  size: number,
  options: Partial<ColumnDef<Enquiry>> = {},
): ColumnDef<Enquiry> {
  return {
    accessorKey: key,
    size,
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      const Icon =
        sorted === "asc"
          ? ArrowUp
          : sorted === "desc"
            ? ArrowDown
            : ArrowUpDown;
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 gap-2"
          onClick={column.getToggleSortingHandler()}
          aria-label={`Sort by ${label}${sorted ? `, currently ${sorted === "asc" ? "ascending" : "descending"}` : ""}`}
        >
          {label}
          <Icon className="size-3.5" />
        </Button>
      );
    },
    cell: ({ getValue }) => (
      <div
        className="whitespace-normal break-words"
        style={{ minWidth: size - 24, maxWidth: size }}
      >
        {String(getValue() ?? "—") || "—"}
      </div>
    ),
    ...options,
  };
}

export const enquiryColumns: ColumnDef<Enquiry>[] = [
  column("created_at", "Created at", 220, {
    sortingFn: (a, b) =>
      Date.parse(a.original.created_at) - Date.parse(b.original.created_at),
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-AU", {
            timeZone: "Australia/Sydney",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    },
  }),
  column("created_by", "Created by", 180),
  column("first_name", "First Name", 180),
  column("surname", "Last Name", 180),
  column("gender", "Gender", 140),
  column("school", "School", 220),
  column("grade", "Grade", 180, {
    filterFn: (row, id, values: string[]) =>
      values.includes(String(row.getValue(id))),
  }),
  column("student_phone_number", "Student’s Phone Number", 240),
  column("email_address", "Email Address", 260),
  column("parent_name", "Parent Name", 180),
  column("parent_phone_number", "Parent’s Phone Number", 240),
  column("suburb_of_home", "Suburb of Home", 180),
  column("subject_selection", "Subject Selection", 220, {
    filterFn: "arrIncludesSome",
    cell: ({ row }) =>
      row.original.subject_selection.length ? (
        <div className="space-y-1">
          {row.original.subject_selection.map((subject, index) => (
            <div key={index}>{subject}</div>
          ))}
        </div>
      ) : (
        "—"
      ),
  }),
  column("preferred_campus", "Preferred Campus", 220),
  column("preferred_class_days_times", "Preferred Class Days / Times", 300),
  column("hear_about_us", "Hear about us", 220),
  column("additional_comments", "Additional comments/questions", 380),
];
