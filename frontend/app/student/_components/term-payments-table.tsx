"use client";

import { useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
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

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatCurrency = (amount: number) => currencyFormatter.format(amount);

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return dateFormatter.format(new Date(date));
};

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

  const totals = useMemo(() => {
    const termAmountDue =
      payments[0]?.amount_due ??
      enrolments.reduce(
        (total, enrolment) =>
          total + Number(enrolment.ClassTime.SubjectOffering.price_per_term),
        0,
      );
    const amountPaid = payments.reduce(
      (total, payment) => total + Number(payment.amount_paid ?? 0),
      0,
    );

    return {
      amountDue: termAmountDue,
      amountPaid,
      outstanding: termAmountDue - amountPaid,
    };
  }, [enrolments, payments]);

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

  return (
    <div className="space-y-3 rounded-md border bg-muted/20 p-3">
      <PaymentDialog
        term={term}
        enrolments={enrolments}
        isOpen={dialogOpen}
        payment={editingPayment}
        onClose={() => setDialogOpen(false)}
        onSaved={onChange}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-medium">Term Payments</span>
          <span className="ml-3 text-muted-foreground">
            Paid {formatCurrency(totals.amountPaid)} of{" "}
            {formatCurrency(totals.amountDue)} · Outstanding{" "}
            {formatCurrency(totals.outstanding)}
          </span>
        </div>
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

      <div className="overflow-hidden rounded-md border bg-primary-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paid At</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-16 text-center text-muted-foreground"
                >
                  No payments recorded for this term.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.payment_id}>
                  <TableCell>{formatDate(payment.payment_date)}</TableCell>
                  <TableCell>{formatCurrency(payment.amount_due)}</TableCell>
                  <TableCell>{formatCurrency(payment.amount_paid)}</TableCell>
                  <TableCell>
                    {formatValuesRemoveUnderscores(payment.status)}
                  </TableCell>
                  <TableCell>
                    {formatValuesRemoveUnderscores(payment.payment_type)}
                  </TableCell>
                  <TableCell>{payment.receipt || "—"}</TableCell>
                  <TableCell>
                    <div className="max-w-[260px] whitespace-normal">
                      {payment.notes || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(payment)}
                        aria-label="Edit payment"
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePayment(payment)}
                        aria-label="Delete payment"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TermPaymentsTable;
