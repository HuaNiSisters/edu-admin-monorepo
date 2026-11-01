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
import { formatDate } from "@/utils/date-utils";
import { formatCurrency } from "@/utils/currency-utils";
import StudentAttendanceGrid from "./student-attendance-grid";
import AddPaymentButton from "./add-payment-button";
import {
  EnrolmentSubjectsTable,
  EnrolmentSubjectRow,
} from "@/components/_reusable/enrolment-subjects-table";

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
  const [editingEnrolment, setEditingEnrolment] =
    useState<EnrolmentWithClassAndTerm | null>(null);
  const [classStartDate, setClassStartDate] = useState("");

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

  const openEnrolmentEditor = (row: EnrolmentSubjectRow) => {
    const enrolment = enrolments.find((item) => item.enrolment_id === row.id);
    if (!enrolment) return;

    const date = new Date(enrolment.enrolment_date);
    setClassStartDate(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    );
    setEditingEnrolment(enrolment);
  };

  const saveEnrolmentDate = async () => {
    if (!editingEnrolment || !classStartDate) return;

    try {
      await enrolmentService.updateEnrolmentDateAsync(
        editingEnrolment.enrolment_id,
        classStartDate,
      );
      toast.success("Class start date updated.");
      setEditingEnrolment(null);
      onChange();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update class start date.",
      );
    }
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

  const subjectRows: EnrolmentSubjectRow[] = enrolments.map((enrolment) => ({
    id: enrolment.enrolment_id,
    classId: enrolment.class_id,
    subjectName: enrolment.ClassTime.SubjectOffering.subject_name,
    grade: enrolment.ClassTime.SubjectOffering.grade,
    dayOfWeek: enrolment.ClassTime.day_of_week,
    startTime: enrolment.ClassTime.start_time,
    location: enrolment.ClassTime.SubjectOffering.location,
    tutor: enrolment.ClassTime.Tutor
      ? `${enrolment.ClassTime.Tutor.first_name} ${enrolment.ClassTime.Tutor.last_name}`
      : null,
    fees: Number(enrolment.ClassTime.SubjectOffering.price_per_term),
  }));

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
        isOpen={editingEnrolment !== null}
        title="Edit class start date"
        onClose={() => setEditingEnrolment(null)}
        onCancel={() => setEditingEnrolment(null)}
        onConfirm={saveEnrolmentDate}
        confirmText="Save changes"
      >
        {editingEnrolment && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {editingEnrolment.ClassTime.day_of_week}{" "}
              {editingEnrolment.ClassTime.start_time} - {editingEnrolment.ClassTime.end_time}
              {editingEnrolment.ClassTime.Tutor
                ? ` (${editingEnrolment.ClassTime.Tutor.first_name} ${editingEnrolment.ClassTime.Tutor.last_name})`
                : ""}
              {" · "}Term {term.name} {term.year}
            </p>
            <div className="grid gap-2">
              <label htmlFor="edit-class-start-date" className="text-sm font-medium">
                Class Start Date
              </label>
              <input
                id="edit-class-start-date"
                type="date"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={classStartDate}
                onChange={(event) => setClassStartDate(event.target.value)}
              />
            </div>
          </div>
        )}
      </ReusableDialog>

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
        <EnrolmentSubjectsTable
          term={term}
          enrolments={subjectRows}
          onEdit={openEnrolmentEditor}
          onDelete={(subjectRow) => {
            const enrolment = enrolments.find(
              (item) => item.enrolment_id === subjectRow.id,
            );
            if (enrolment) requestDeleteEnrolment(enrolment);
          }}
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
