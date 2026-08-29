"use client";

import { Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import ReusableTable, {
  ReusableTableColumn,
} from "@/components/_reusable/reusable-table";
import { Term } from "@/lib/api/types";
import { formatCurrency } from "@/utils/currency-utils";
import { formatDate } from "@/utils/date-utils";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import { formatTime } from "@/utils/time-utils";

export type EnrolmentSubjectRow = {
  id: string;
  classId: string;
  subjectName: string;
  grade: string | number | null | undefined;
  dayOfWeek: string;
  startTime: string;
  location: string | null | undefined;
  tutor?: string | null;
  fees?: number;
};

interface EnrolmentSubjectsTableProps {
  term: Term;
  enrolments: EnrolmentSubjectRow[];
  onEdit?: (enrolment: EnrolmentSubjectRow) => void;
  onDelete?: (enrolment: EnrolmentSubjectRow) => void;
}

export function EnrolmentSubjectsTable({
  term,
  enrolments,
  onEdit,
  onDelete,
}: EnrolmentSubjectsTableProps) {
  const columns: ReusableTableColumn<EnrolmentSubjectRow>[] = [
    { key: "grade", header: "Grade", cell: (enrolment) => enrolment.grade },
    {
      key: "subject",
      header: "Subject",
      cell: (enrolment) => enrolment.subjectName,
    },
    { key: "day", header: "Day", cell: (enrolment) => enrolment.dayOfWeek },
    {
      key: "time",
      header: "Time",
      cell: (enrolment) => formatTime(enrolment.startTime),
    },
    {
      key: "location",
      header: "Location",
      cell: (enrolment) =>
        enrolment.location
          ? formatValuesRemoveUnderscores(enrolment.location)
          : "—",
    },
    {
      key: "class_start_date",
      header: "Class Start Date",
      cell: () => formatDate(term.start_date),
    },
    {
      key: "tutor",
      header: "Tutor",
      cell: (enrolment) => enrolment.tutor || "—",
    },
    {
      key: "fees",
      header: "Fees",
      cell: (enrolment) =>
        enrolment.fees == null ? "—" : formatCurrency(enrolment.fees),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (enrolment) => (
        <div className="flex gap-2">
          {onEdit && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              size="icon"
              onClick={() => onEdit(enrolment)}
              aria-label="Edit enrolment"
            >
              <Edit className="size-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              size="icon"
              onClick={() => onDelete(enrolment)}
              aria-label="Remove enrolment"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <ReusableTable
      columns={columns}
      data={enrolments}
      getRowKey={(enrolment) => enrolment.id}
      emptyMessage="No subjects found for this term."
    />
  );
}
