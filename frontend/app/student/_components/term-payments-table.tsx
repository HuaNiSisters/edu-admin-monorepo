"use client";

import { useState } from "react";
import { Edit, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EnrolmentWithClassAndTerm,
  PaymentWithDetails,
  Term,
} from "@/lib/api/types";
import { paymentService } from "@/lib/services";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import PaymentDialog from "./payment-dialog";
import { formatTime } from "@/utils/time-utils";
import { formatDate } from "@/utils/date-utils";
import { formatCurrency } from "@/utils/currency-utils";

type TermPaymentsTableProps = {
  term: Term;
  enrolments: EnrolmentWithClassAndTerm[];
  payments: PaymentWithDetails[];
  onChange: () => void;
};

const TermPaymentsTable = ({
  term,
  enrolments,
  payments,
  onChange,
}: TermPaymentsTableProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<PaymentWithDetails | null>(null);

  const openCreateDialog = () => {
    setEditingPayment(null);
    setDialogOpen(true);
  };

  const openEditDialog = (payment: PaymentWithDetails) => {
    setEditingPayment(payment);
    setDialogOpen(true);
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

  const subjectNames = enrolments
    .map((enrolment) => enrolment.ClassTime.SubjectOffering.subject_name)
    .join(", ");

  return (
    <div className="space-y-6">
      <PaymentDialog
        term={term}
        enrolments={enrolments}
        isOpen={dialogOpen}
        payment={editingPayment}
        onClose={() => setDialogOpen(false)}
        onSaved={onChange}
      />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold tracking-normal">Subjects</h3>
        <div className="overflow-hidden rounded-md border bg-primary-foreground">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Class Start Date</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Fees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrolments.map((enrolment) => (
                <TableRow key={enrolment.enrolment_id}>
                  <TableCell>
                    {enrolment.ClassTime.SubjectOffering.grade}
                  </TableCell>
                  <TableCell>
                    {enrolment.ClassTime.SubjectOffering.subject_name}
                  </TableCell>
                  <TableCell>{enrolment.ClassTime.day_of_week}</TableCell>
                  <TableCell>
                    {formatTime(enrolment.ClassTime.start_time)}
                  </TableCell>
                  <TableCell>
                    {formatValuesRemoveUnderscores(
                      enrolment.ClassTime.SubjectOffering.location,
                    )}
                  </TableCell>
                  <TableCell>{formatDate(term.start_date)}</TableCell>
                  <TableCell>
                    {enrolment.ClassTime.Tutor
                      ? `${enrolment.ClassTime.Tutor.first_name} ${enrolment.ClassTime.Tutor.last_name}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      Number(
                        enrolment.ClassTime.SubjectOffering.price_per_term,
                      ),
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3 border-t pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-normal">Payments</h3>
          <Button
            size="sm"
            className="gap-2"
            onClick={openCreateDialog}
            disabled={enrolments.length === 0}
          >
            <Plus className="size-4" />
            Add Payment
          </Button>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Paid</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-16 text-center text-muted-foreground"
                  >
                    No payments recorded for this term.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.payment_id}>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>{formatCurrency(payment.amount_paid)}</TableCell>
                    <TableCell>{subjectNames || "—"}</TableCell>
                    <TableCell>
                      {formatValuesRemoveUnderscores(payment.payment_type)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[420px] whitespace-normal">
                        {payment.notes || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
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
                            toast.info(
                              "Receipt download is not implemented yet.",
                            )
                          }
                          aria-label="Receipt download not implemented"
                        >
                          <FileText className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default TermPaymentsTable;
