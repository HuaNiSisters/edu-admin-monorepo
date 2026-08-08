"use client";

import { useState } from "react";
import { Edit, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ReusableTable, {
  ReusableTableColumn,
} from "@/components/_reusable/reusable-table";
import { ReusableDialog } from "@/components/_reusable/reuseable-dialog";
import {
  Attendance,
  EnrolmentWithClassAndTerm,
  PaymentWithDetails,
  Term,
} from "@/lib/api/types";
import { enrolmentService, paymentService } from "@/lib/services";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import PaymentDialog from "./payment-dialog";
import { formatTime } from "@/utils/time-utils";
import { formatDate } from "@/utils/date-utils";
import { formatCurrency } from "@/utils/currency-utils";
import StudentAttendanceGrid from "./student-attendance-grid";
import AddPaymentButton from "./add-payment-button";

type TermPaymentsTableProps = {
  studentId: string;
  term: Term;
  enrolments: EnrolmentWithClassAndTerm[];
  payments: PaymentWithDetails[];
  attendanceRecords: Attendance[];
  onChange: () => void;
};

const TermPaymentsTable = ({
  studentId,
  term,
  enrolments,
  payments,
  attendanceRecords,
  onChange,
}: TermPaymentsTableProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<PaymentWithDetails | null>(null);
  const [enrolmentToDelete, setEnrolmentToDelete] =
    useState<EnrolmentWithClassAndTerm | null>(null);

  const openEditDialog = (payment: PaymentWithDetails) => {
    setEditingPayment(payment);
    setEditDialogOpen(true);
  };

  const deletePayment = async (payment: PaymentWithDetails) => {
    const confirmed = window.confirm(
      `Delete payment ${payment.receipt || payment.payment_id}?`,
    );
    if (!confirmed) return;

    await paymentService.deletePaymentAsync(payment.payment_id);
    toast.success("Payment deleted.");
    onChange();
  };

  const requestDeleteEnrolment = (enrolment: EnrolmentWithClassAndTerm) => {
    const hasPayments = payments.some(
      (payment) => payment.enrolment_id === enrolment.enrolment_id,
    );

    if (hasPayments) {
      toast.error(
        "Delete this enrolment's payment records before removing it.",
      );
      return;
    }

    setEnrolmentToDelete(enrolment);
  };

  const deleteEnrolment = async () => {
    if (!enrolmentToDelete) return;

    try {
      await enrolmentService.deleteEnrolmentAsync(
        enrolmentToDelete.enrolment_id,
      );
      toast.success("Enrolment removed.");
      onChange();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove enrolment.",
      );
    } finally {
      setEnrolmentToDelete(null);
    }
  };

  const subjectNames = enrolments
    .map((enrolment) => enrolment.ClassTime.SubjectOffering.subject_name)
    .join(", ");

  const subjectColumns: ReusableTableColumn<EnrolmentWithClassAndTerm>[] = [
    {
      key: "grade",
      header: "Grade",
      cell: (enrolment) => enrolment.ClassTime.SubjectOffering.grade,
    },
    {
      key: "subject",
      header: "Subject",
      cell: (enrolment) => enrolment.ClassTime.SubjectOffering.subject_name,
    },
    {
      key: "day",
      header: "Day",
      cell: (enrolment) => enrolment.ClassTime.day_of_week,
    },
    {
      key: "time",
      header: "Time",
      cell: (enrolment) => formatTime(enrolment.ClassTime.start_time),
    },
    {
      key: "location",
      header: "Location",
      cell: (enrolment) =>
        formatValuesRemoveUnderscores(
          enrolment.ClassTime.SubjectOffering.location,
        ),
    },
    {
      key: "class_start_date",
      header: "Class Start Date",
      cell: () => formatDate(term.start_date),
    },
    {
      key: "tutor",
      header: "Tutor",
      cell: (enrolment) =>
        enrolment.ClassTime.Tutor
          ? `${enrolment.ClassTime.Tutor.first_name} ${enrolment.ClassTime.Tutor.last_name}`
          : "—",
    },
    {
      key: "fees",
      header: "Fees",
      cell: (enrolment) =>
        formatCurrency(
          Number(enrolment.ClassTime.SubjectOffering.price_per_term),
        ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (enrolment) => (
        <Button
          className="bg-red-600 text-white hover:bg-red-700"
          size="icon"
          onClick={() => requestDeleteEnrolment(enrolment)}
          aria-label="Remove enrolment"
        >
          <Trash2 className="size-4" />
        </Button>
      ),
    },
  ];

  const paymentColumns: ReusableTableColumn<PaymentWithDetails>[] = [
    {
      key: "date_paid",
      header: "Date Paid",
      cell: (payment) => formatDate(payment.payment_date),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (payment) => formatCurrency(payment.amount_paid),
    },
    {
      key: "subject",
      header: "Subject",
      cell: () => subjectNames || "—",
    },
    {
      key: "payment_type",
      header: "Payment Type",
      cell: (payment) => formatValuesRemoveUnderscores(payment.payment_type),
    },
    {
      key: "notes",
      header: "Notes",
      className: "whitespace-normal",
      cell: (payment) => (
        <div className="max-w-[420px] whitespace-normal">
          {payment.notes || "—"}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (payment) => (
        <div className="flex gap-2">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="icon"
            onClick={() => openEditDialog(payment)}
            aria-label="Edit payment"
          >
            <Edit className="size-4" />
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            size="icon"
            onClick={() => deletePayment(payment)}
            aria-label="Delete payment"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            className="bg-lime-600 text-white hover:bg-lime-700"
            size="icon"
            onClick={() =>
              toast.info("Receipt download is not implemented yet.")
            }
            aria-label="Receipt download not implemented"
          >
            <FileText className="size-4" />
          </Button>
        </div>
      ),
    },
  ].map( (column) => ({
    ...column,
    headerClassName: "bg-slate-800 border-slate-700 text-white",
  }));

  return (
    <div className="space-y-6">
      <ReusableDialog
        isOpen={enrolmentToDelete !== null}
        title="Remove enrolment?"
        onClose={() => setEnrolmentToDelete(null)}
        onCancel={() => setEnrolmentToDelete(null)}
        onConfirm={deleteEnrolment}
        confirmText="OK"
      >
        <p className="text-sm text-muted-foreground">
          Remove {enrolmentToDelete?.ClassTime.SubjectOffering.subject_name} (
          Grade {enrolmentToDelete?.ClassTime.SubjectOffering.grade}) from Term{" "}
          {term.name} {term.year}?
        </p>
      </ReusableDialog>

      <PaymentDialog
        term={term}
        enrolments={enrolments}
        isOpen={editDialogOpen}
        payment={editingPayment}
        onClose={() => setEditDialogOpen(false)}
        onSaved={onChange}
      />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold tracking-normal">Subjects</h3>
        <ReusableTable
          columns={subjectColumns}
          data={enrolments}
          getRowKey={(enrolment) => enrolment.enrolment_id}
          emptyMessage="No subjects found for this term."
        />
      </section>

      <section className="space-y-3 border-t pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-normal">Payments</h3>
          <AddPaymentButton
            term={term}
            enrolments={enrolments}
            onSaved={onChange}
          />
        </div>

        <ReusableTable
          columns={paymentColumns}
          data={payments}
          getRowKey={(payment) => payment.payment_id}
          emptyMessage="No payments recorded for this term."
          containerClassName="border-slate-700 bg-slate-800"
          rowClassName="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
          emptyCellClassName="bg-slate-800 text-slate-300"
        />
      </section>

      <section className="space-y-3 border-t pt-5">
        <h3 className="text-lg font-semibold tracking-normal">Attendance</h3>

        <StudentAttendanceGrid
          studentId={studentId}
          term={term}
          enrolments={enrolments}
          attendanceRecords={attendanceRecords}
        />
      </section>
    </div>
  );
};

export default TermPaymentsTable;
