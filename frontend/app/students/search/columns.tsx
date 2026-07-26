"use client";

import { SearchStudentsResponse } from "@/lib/api/types/person/student";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import AddPaymentButton from "@/app/student/_components/add-payment-button";

type StudentRow = SearchStudentsResponse[number];

export const getColumns = (
  onPaymentSaved: () => void,
): ColumnDef<StudentRow>[] => [
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
      <div className="flex flex-col gap-1 pl-4">
        <span>{row.original.first_name}</span>
        <div className="text-xs flex flex-col">
          <span>Gender: {row.original.gender ?? "N/A"}</span>
          <span>Grade at school: {row.original.grade_at_school}</span>
          <span>School: {row.original.school}</span>
        </div>
        <div>
          <Badge
            className={
              row.original.status === "active" ? "default" : "secondary"
            }
          >
            {row.original.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
    ),
    size: 50,
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
    size: 50,
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
    accessorKey: "recent_enrolments",
    header: "Recent Enrolment",
    cell: ({ row }) => {
      const { recent_term, recent_enrolments } = row.original;

      if (
        !recent_term ||
        !recent_enrolments ||
        recent_enrolments.length === 0
      ) {
        return (
          <span className="text-muted-foreground text-sm">No enrolments</span>
        );
      }

      return (
        <div className="rounded-md overflow-hidden border border-slate-400 min-w-[360px] max-w-[420px]">
          <div className="bg-slate-700 text-white text-center font-semibold py-1 text-sm">
            Term {recent_term.name} {recent_term.year}
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] bg-slate-800 text-white text-xs font-medium border-t">
            <div className="px-2 py-1">Grade &amp; Subject</div>
            <div className="px-2 py-1">Payment</div>
            <div className="px-2 py-1 w-[50px]" />
          </div>
          {recent_enrolments.map((enr) => (
            <div
              key={enr.enrolment_id}
              className="grid grid-cols-[1fr_auto_auto] bg-slate-800 text-white text-xs border-t border-slate-700"
            >
              <div className="px-2 py-1.5">
                <div className="font-medium">
                  {enr.ClassTime.SubjectOffering.grade} -{" "}
                  {enr.ClassTime.SubjectOffering.subject_name}
                </div>
                <div className="text-slate-300 text-[11px]">
                  {enr.ClassTime.day_of_week} {enr.ClassTime.start_time} ·{" "}
                </div>
                <div className="text-slate-300 text-[11px]">
                  {formatValuesRemoveUnderscores(
                    enr.ClassTime.SubjectOffering.location,
                  )}
                </div>
                <div className="text-slate-400 text-[11px]">
                  Start Date:{" "}
                  {new Date(enr.enrolment_date).toLocaleDateString()}
                </div>
              </div>
              <div className="px-2 py-1.5">
                {enr.latest_payment ? (
                  <>
                    <div className="font-semibold underline whitespace-nowrap">
                      ${enr.latest_payment.amount_paid} paid
                      {enr.latest_payment.payment_date
                        ? ` at ${new Date(enr.latest_payment.payment_date).toLocaleDateString()}`
                        : ""}
                    </div>
                    {enr.latest_payment.notes && (
                      <div className="text-slate-300 text-[11px]">
                        {enr.latest_payment.notes}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400 whitespace-nowrap">
                    No payment
                  </span>
                )}
              </div>
              <div
                className="px-2 py-1.5 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <AddPaymentButton
                  term={recent_term}
                  enrolments={[enr]}
                  onSaved={() => onPaymentSaved()}
                  size="sm"
                  className="bg-lime-200 text-slate-900 hover:bg-lime-300 rounded-full h-7 px-2 text-xs"
                  label="Add"
                />
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
];
