import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X } from "lucide-react";
import { StudentOwing } from "@/lib/api/types/owing";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import { formatPhoneNumber } from "@/utils/phone-utils";

const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export const OWING_SMS_TEMPLATES = ["Payment reminder", "Overdue follow-up"];
export const OWING_SENT_FILTER_ID = "sent_templates";

type OwingColumnOptions = {
  selectedIds: Set<string>;
  onToggleSelected: (enrolmentId: string, selected: boolean) => void;
  allSelected: boolean;
  onToggleAll: (selected: boolean) => void;
  sentTemplatesByEnrolment: Record<string, string[]>;
};

function displayLocation(location: string) {
  if (location === "cabramatta_and_canley_vale") {
    return "Cabramatta & Canley Vale";
  }
  return formatValuesRemoveUnderscores(location);
}

export const createOwingColumns = ({
  selectedIds,
  onToggleSelected,
  allSelected,
  onToggleAll,
  sentTemplatesByEnrolment,
}: OwingColumnOptions): ColumnDef<StudentOwing>[] => [
  {
    id: "select",
    size: 40,
    header: () => (
      <Checkbox
        aria-label="Select all students"
        checked={allSelected}
        onCheckedChange={(checked) => onToggleAll(checked === true)}
      />
    ),
    cell: ({ row }) => (
      <div onClick={(event) => event.stopPropagation()}>
        <Checkbox
          aria-label={`Select ${row.original.student_name}`}
          checked={selectedIds.has(row.original.enrolment_id)}
          onCheckedChange={(checked) =>
            onToggleSelected(row.original.enrolment_id, checked === true)
          }
        />
      </div>
    ),
  },
  {
    id: "sent",
    header: "Sent",
    size: 210,
    cell: ({ row }) => {
      const sent = new Set([
        ...row.original.sent_templates,
        ...(sentTemplatesByEnrolment[row.original.enrolment_id] ?? []),
      ]);
      return (
        <div className="space-y-2 whitespace-normal">
          {OWING_SMS_TEMPLATES.map((template) => (
            <div
              key={template}
              className="flex items-center justify-start gap-2"
            >
              <span className="text-base font-medium">{template}</span>
              {sent.has(template) ? (
                <Check
                  className="size-4 shrink-0 text-green-600"
                  aria-label="Sent"
                />
              ) : (
                <X
                  className="size-4 shrink-0 text-red-600"
                  aria-label="Not sent"
                />
              )}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "student_name",
    header: "Student",
    size: 160,
    filterFn: (row, columnId, value: string) =>
      String(row.getValue(columnId))
        .toLowerCase()
        .includes(value.toLowerCase()),
    cell: ({ row }) => (
      <div className="whitespace-normal">
        <div className="font-medium">{row.original.student_name}</div>
        <div className="text-xs text-muted-foreground">
          {formatPhoneNumber(row.original.student_mobile)}
        </div>
      </div>
    ),
  },
  {
    id: "parents",
    header: "Parents",
    size: 180,
    cell: ({ row }) => (
      <div className="space-y-1 whitespace-normal">
        {row.original.parents.length ? (
          row.original.parents.map((parent, index) => (
            <div key={`${parent.phone}-${index}`}>
              <div>{parent.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatPhoneNumber(parent.phone)}
              </div>
            </div>
          ))
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "term_label",
    header: "Term",
    filterFn: "arrIncludesSome",
  },
  {
    id: "class",
    header: "Class",
    size: 200,
    cell: ({ row }) => (
      <div className="whitespace-pre-line">
        {`Year ${row.original.grade} ${row.original.subject_name}\n${row.original.day_of_week} ${row.original.start_time}\n${displayLocation(row.original.location)}`}
      </div>
    ),
  },
  {
    accessorKey: "tutor",
    header: "Tutor",
    cell: ({ row }) => row.original.tutor || "—",
  },
  {
    id: OWING_SENT_FILTER_ID,
    accessorFn: (row: StudentOwing) => row.sent_templates,
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "amount_outstanding",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-semibold">
        {currency.format(row.original.amount_outstanding)}
      </span>
    ),
  },
  {
    accessorKey: "grade",
    header: "Grade",
    filterFn: (row, columnId, values: string[]) =>
      values.includes(String(row.getValue(columnId))),
  },
  {
    accessorKey: "subject_name",
    header: "Subject",
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "location",
    header: "Location",
    filterFn: (row, columnId, values: string[]) =>
      values.includes(
        formatValuesRemoveUnderscores(String(row.getValue(columnId))),
      ),
  },
];
