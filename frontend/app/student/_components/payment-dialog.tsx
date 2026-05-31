"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ReusableDialog } from "@/components/_reusable/reuseable-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EnrolmentWithClassAndTerm,
  PaymentStatus,
  PaymentType,
  PaymentWithDetails,
  Term,
} from "@/lib/api/types";
import { paymentService } from "@/lib/services";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

const PAYMENT_TYPES: PaymentType[] = ["cash", "bank_transfer", "other"];
const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "partial", "paid"];

type PaymentDialogProps = {
  term: Term;
  enrolments: EnrolmentWithClassAndTerm[];
  isOpen: boolean;
  payment?: PaymentWithDetails | null;
  onClose: () => void;
  onSaved: () => void;
};

type PaymentFormState = {
  amountDue: string;
  amountPaid: string;
  paymentDate: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  receipt: string;
  notes: string;
};

const toDateInputValue = (date?: string | null) => {
  if (!date) return new Date().toISOString().slice(0, 10);
  return new Date(date).toISOString().slice(0, 10);
};

const PaymentDialog = ({
  term,
  enrolments,
  isOpen,
  payment,
  onClose,
  onSaved,
}: PaymentDialogProps) => {
  const defaultAmountDue = useMemo(
    () =>
      String(
        enrolments.reduce(
          (total, enrolment) =>
            total + Number(enrolment.ClassTime.SubjectOffering.price_per_term),
          0,
        ),
      ),
    [enrolments],
  );

  const paymentAnchorEnrolmentId = useMemo(
    () => payment?.enrolment_id ?? enrolments[0]?.enrolment_id,
    [enrolments, payment],
  );

  const [formState, setFormState] = useState<PaymentFormState>({
    amountDue: defaultAmountDue,
    amountPaid: "",
    paymentDate: toDateInputValue(),
    paymentType: "cash",
    status: "paid",
    receipt: "",
    notes: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    setFormState({
      amountDue: String(payment?.amount_due ?? defaultAmountDue),
      amountPaid: String(payment?.amount_paid ?? ""),
      paymentDate: toDateInputValue(payment?.payment_date),
      paymentType: payment?.payment_type ?? "cash",
      status: payment?.status ?? "paid",
      receipt: payment?.receipt ?? "",
      notes: payment?.notes ?? "",
    });
  }, [defaultAmountDue, isOpen, payment]);

  const updateField = <TKey extends keyof PaymentFormState>(
    key: TKey,
    value: PaymentFormState[TKey],
  ) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const handleConfirm = async () => {
    const amountDue = Number(formState.amountDue);
    const amountPaid = Number(formState.amountPaid);

    if (Number.isNaN(amountDue) || amountDue < 0) {
      toast.error("Amount due must be a valid number.");
      return;
    }

    if (Number.isNaN(amountPaid) || amountPaid < 0) {
      toast.error("Amount paid must be a valid number.");
      return;
    }

    if (!formState.receipt.trim()) {
      toast.error("Receipt/reference is required.");
      return;
    }

    if (!paymentAnchorEnrolmentId) {
      toast.error("A payment needs at least one enrolment in the term.");
      return;
    }

    const paymentData = {
      enrolment_id: paymentAnchorEnrolmentId,
      amount_due: amountDue,
      amount_paid: amountPaid,
      payment_date: formState.paymentDate
        ? new Date(formState.paymentDate).toISOString()
        : null,
      payment_type: formState.paymentType,
      status: formState.status,
      receipt: formState.receipt.trim(),
      notes: formState.notes.trim() || null,
    };

    if (payment) {
      await paymentService.updatePaymentAsync(payment.payment_id, paymentData);
      toast.success("Payment updated.");
    } else {
      await paymentService.createPaymentAsync(paymentData);
      toast.success("Payment added.");
    }

    onSaved();
    onClose();
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      title={payment ? "Edit payment" : "Add payment"}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={handleConfirm}
      confirmText={payment ? "Save Payment" : "Add Payment"}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Term</Label>
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
            {term.year} Term {term.name} ·{" "}
            {enrolments
              .map(
                (enrolment) =>
                  `${enrolment.ClassTime.SubjectOffering.subject_name} (Grade ${enrolment.ClassTime.SubjectOffering.grade})`,
              )
              .join(", ")}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="amount_due">Amount Due</Label>
            <Input
              id="amount_due"
              type="number"
              min="0"
              step="0.01"
              value={formState.amountDue}
              onChange={(event) => updateField("amountDue", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount_paid">Amount Paid</Label>
            <Input
              id="amount_paid"
              type="number"
              min="0"
              step="0.01"
              value={formState.amountPaid}
              onChange={(event) =>
                updateField("amountPaid", event.target.value)
              }
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="payment_date">Paid At</Label>
            <Input
              id="payment_date"
              type="date"
              value={formState.paymentDate}
              onChange={(event) =>
                updateField("paymentDate", event.target.value)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Payment Type</Label>
            <Select
              value={formState.paymentType}
              onValueChange={(value: PaymentType) =>
                updateField("paymentType", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map((paymentType) => (
                  <SelectItem key={paymentType} value={paymentType}>
                    {formatValuesRemoveUnderscores(paymentType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Payment Status</Label>
            <Select
              value={formState.status}
              onValueChange={(value: PaymentStatus) =>
                updateField("status", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatValuesRemoveUnderscores(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="receipt">Receipt / Reference</Label>
            <Input
              id="receipt"
              value={formState.receipt}
              onChange={(event) => updateField("receipt", event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="payment_notes">Notes</Label>
          <Textarea
            id="payment_notes"
            value={formState.notes}
            onChange={(event) => updateField("notes", event.target.value)}
          />
        </div>
      </div>
    </ReusableDialog>
  );
};

export default PaymentDialog;
