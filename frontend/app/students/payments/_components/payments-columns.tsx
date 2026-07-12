"use client";

import { PaymentWithDetails } from "@/lib/api/types";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import { ColumnDef } from "@tanstack/react-table";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return dateFormatter.format(new Date(date));
};

export const createPaymentColumns = (): ColumnDef<PaymentWithDetails>[] => [
  {
    accessorKey: "student_name",
    size: 180,
    header: "Student",
    filterFn: "equalsString",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium text-primary">
          {row.original.student_name}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.student_mobile || "—"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "parents",
    size: 260,
    header: "Parents",
    cell: ({ row }) => (
      <div className="max-w-[260px] whitespace-pre-line text-sm leading-5">
        {row.original.parents || "—"}
      </div>
    ),
  },
  {
    accessorKey: "term_label",
    size: 110,
    header: "Term",
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "grade",
    header: "Grade",
    filterFn: (row, columnId, filterValue: string[]) =>
      filterValue.includes(String(row.getValue(columnId))),
  },
  {
    accessorKey: "subject_name",
    size: 160,
    header: "Subject",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div>{row.original.subject_name || "—"}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.grade ? `Grade ${row.original.grade}` : "—"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "day_of_week",
    size: 110,
    header: "Day",
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "amount_paid",
    size: 110,
    header: "Paid",
    cell: ({ row }) => formatCurrency(row.original.amount_paid),
  },
  {
    accessorKey: "payment_date",
    size: 120,
    header: "Paid At",
    cell: ({ row }) => formatDate(row.original.payment_date),
  },
  {
    accessorKey: "receipt",
    size: 120,
    header: "Receipt",
    cell: ({ row }) => row.original.receipt || "—",
  },
  {
    id: "receipt_status",
    size: 140,
    header: "Receipt Status",
    cell: ({ row }) => (row.original.receipt ? "Receipt sent" : "Not sent"),
  },
  {
    accessorKey: "status",
    size: 110,
    header: "Status",
    filterFn: "arrIncludesSome",
    cell: () => "Follow up",
  },
  {
    accessorKey: "payment_type",
    size: 140,
    header: "Type",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => formatValuesRemoveUnderscores(row.original.payment_type),
  },
  {
    accessorKey: "notes",
    size: 260,
    header: "Notes",
    cell: ({ row }) => (
      <div className="max-w-[320px] whitespace-normal">
        {row.original.notes || "—"}
      </div>
    ),
  },
];

export { formatCurrency };
