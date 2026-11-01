"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ReusableDialog } from "@/components/_reusable/reuseable-dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
import { enrolmentService, paymentService, termService } from "@/lib/services";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

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
  paymentType: PaymentType | "";
  status: PaymentStatus | "";
  receipt: string;
  notes: string;
};

const CREATE_TERM_OPTION = "__create_future_term__";

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
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([]);
  const [studentEnrolments, setStudentEnrolments] = useState(enrolments);
  const [availableTerms, setAvailableTerms] = useState<Term[]>([term]);
  const [termsLoaded, setTermsLoaded] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState(term.term_id);
  const [newTermStartDate, setNewTermStartDate] = useState("");
  const [newTermEndDate, setNewTermEndDate] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(
    () => enrolments.map((enrolment) => enrolment.class_id),
  );

  const latestTerm = [...availableTerms].sort(
    (a, b) => b.year - a.year || b.name - a.name,
  )[0] ?? term;
  const nextTerm =
    latestTerm.name < 4
      ? { year: latestTerm.year, name: latestTerm.name + 1 }
      : { year: latestTerm.year + 1, name: 1 };

  const selectedEnrolments = useMemo(
    () =>
      enrolments.filter((enrolment) =>
        selectedClassIds.includes(enrolment.class_id),
      ),
    [enrolments, selectedClassIds],
  );

  const defaultAmountDue = useMemo(
    () =>
      String(
        selectedEnrolments.reduce(
          (total, enrolment) =>
            total + Number(enrolment.ClassTime.SubjectOffering.price_per_term),
          0,
        ),
      ),
    [selectedEnrolments],
  );

  const paymentAnchorEnrolmentId = useMemo(
    () => payment?.enrolment_id ?? selectedEnrolments[0]?.enrolment_id,
    [payment, selectedEnrolments],
  );

  const [formState, setFormState] = useState<PaymentFormState>({
    amountDue: defaultAmountDue,
    amountPaid: "",
    paymentDate: toDateInputValue(),
    paymentType: "",
    status: "",
    receipt: "",
    notes: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    const initialClassIds = enrolments.map((enrolment) => enrolment.class_id);
    setStudentEnrolments(enrolments);
    setAvailableTerms([term]);
    setTermsLoaded(false);
    setSelectedTermId(term.term_id);
    setNewTermStartDate("");
    setNewTermEndDate("");
    setSelectedClassIds(initialClassIds);

    const studentId = enrolments[0]?.student_id;
    if (!studentId) return;

    const fetchStudentPaymentOptions = async () => {
      try {
        const [studentEnrolments, terms] = await Promise.all([
          enrolmentService.getEnrolmentsByStudentIdAsync(studentId),
          termService.getTermsAsync(),
        ]);

        setStudentEnrolments(studentEnrolments);
        setAvailableTerms(
          Array.from(
            new Map(
              [term, ...terms]
                .filter(
                  (availableTerm) =>
                    new Date(availableTerm.start_date) >=
                    new Date(term.start_date),
                )
                .map((availableTerm) => [
                  availableTerm.term_id,
                  availableTerm,
                ]),
            ).values(),
          ),
        );
        setTermsLoaded(true);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load terms.",
        );
      }
    };

    fetchStudentPaymentOptions();
  }, [enrolments, isOpen, term]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPaymentOptions = async () => {
      const [types, statuses] = await Promise.all([
        paymentService.getPaymentTypesAsync(),
        paymentService.getPaymentStatusesAsync(),
      ]);

      setPaymentTypes(types);
      setPaymentStatuses(statuses);
    };

    fetchPaymentOptions();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const defaultPaymentType =
      payment?.payment_type ?? paymentTypes[0] ?? "";
    const defaultPaymentStatus = payment?.status ?? paymentStatuses[0] ?? "";

    setFormState({
      amountDue: String(payment?.amount_due ?? defaultAmountDue),
      amountPaid: String(payment?.amount_paid ?? ""),
      paymentDate: toDateInputValue(payment?.payment_date),
      paymentType: defaultPaymentType,
      status: defaultPaymentStatus,
      receipt: payment?.receipt ?? "",
      notes: payment?.notes ?? "",
    });
  }, [
    defaultAmountDue,
    isOpen,
    payment,
    paymentStatuses,
    paymentTypes,
  ]);

  const selectTerm = (termId: string) => {
    setSelectedTermId(termId);
    setSelectedClassIds(enrolments.map((enrolment) => enrolment.class_id));
  };

  const toggleEnrolment = (classId: string, isSelected: boolean) => {
    setSelectedClassIds((current) =>
      isSelected
        ? [...new Set([...current, classId])]
        : current.filter((id) => id !== classId),
    );
  };

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

    if (selectedEnrolments.length === 0) {
      toast.error("Select at least one enrolment to pay for.");
      return;
    }

    if (!formState.paymentType) {
      toast.error("Payment type is required.");
      return;
    }

    if (!formState.status) {
      toast.error("Payment status is required.");
      return;
    }

    let paymentEnrolmentId = paymentAnchorEnrolmentId;
    let targetTermId = selectedTermId;

    if (selectedTermId === CREATE_TERM_OPTION) {
      if (!newTermStartDate || !newTermEndDate) {
        toast.error("Enter the start and end dates for the new term.");
        return;
      }
      if (new Date(newTermEndDate) < new Date(newTermStartDate)) {
        toast.error("The term end date must be after its start date.");
        return;
      }

      try {
        const createdTerm = await termService.createTermAsync({
          year: nextTerm.year,
          name: nextTerm.name,
          start_date: new Date(`${newTermStartDate}T12:00:00`).toISOString(),
          end_date: new Date(`${newTermEndDate}T12:00:00`).toISOString(),
        });
        targetTermId = createdTerm.term_id;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create the term.",
        );
        return;
      }
    }

    if (!payment) {
      const selectedTerm = availableTerms.find(
        (availableTerm) => availableTerm.term_id === targetTermId,
      );
      try {
        const targetEnrolments = await Promise.all(
          selectedEnrolments.map(async (enrolment) => {
            const existingEnrolment = studentEnrolments.find(
              (existing) =>
                existing.term_id === targetTermId &&
                existing.class_id === enrolment.class_id,
            );
            if (existingEnrolment) return existingEnrolment;

            return enrolmentService.enrolAsync({
              studentId: enrolment.student_id,
              classId: enrolment.class_id,
              termId: targetTermId,
              classStartDate:
                selectedTerm?.start_date ??
                new Date(`${newTermStartDate}T12:00:00`).toISOString(),
            });
          }),
        );
        paymentEnrolmentId = targetEnrolments[0]?.enrolment_id;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to create term enrolments.",
        );
        return;
      }
    }

    if (!paymentEnrolmentId) {
      toast.error("Unable to create an enrolment for this payment.");
      return;
    }

    const paymentData = {
      enrolment_id: paymentEnrolmentId,
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

    try {
      if (payment) {
        await paymentService.updatePaymentAsync(payment.payment_id, paymentData);
        toast.success("Payment updated.");
      } else {
        await paymentService.createPaymentAsync(paymentData);
        toast.success("Payment added.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save payment.",
      );
      return;
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
          <Select
            value={selectedTermId}
            onValueChange={selectTerm}
            disabled={Boolean(payment) || !termsLoaded}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTerms.map((availableTerm) => (
                <SelectItem key={availableTerm.term_id} value={availableTerm.term_id}>
                  {availableTerm.year} Term {availableTerm.name}
                </SelectItem>
              ))}
              <SelectItem value={CREATE_TERM_OPTION}>
                Set up {nextTerm.year} Term {nextTerm.name}…
              </SelectItem>
            </SelectContent>
          </Select>
          {!termsLoaded && (
            <p className="text-xs text-muted-foreground">Loading terms…</p>
          )}
          {termsLoaded && selectedTermId === CREATE_TERM_OPTION && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="new-term-start-date">Term start date</Label>
                <Input
                  id="new-term-start-date"
                  type="date"
                  value={newTermStartDate}
                  onChange={(event) => setNewTermStartDate(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-term-end-date">Term end date</Label>
                <Input
                  id="new-term-end-date"
                  type="date"
                  value={newTermEndDate}
                  onChange={(event) => setNewTermEndDate(event.target.value)}
                />
              </div>
            </div>
          )}
          {!payment && (
            <p className="text-xs text-muted-foreground">
              Saving for a future term enrols the selected classes in that term.
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Enrolments</Label>
          <div className="rounded-md border divide-y">
            {enrolments.map((enrolment) => {
              const classId = enrolment.class_id;
              const subjectOffering = enrolment.ClassTime.SubjectOffering;

              return (
                <label
                  key={classId}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={selectedClassIds.includes(classId)}
                    onCheckedChange={(checked) =>
                      toggleEnrolment(classId, checked === true)
                    }
                  />
                  {subjectOffering.subject_name} (Grade {subjectOffering.grade})
                </label>
              );
            })}
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
                {paymentTypes.map((paymentType) => (
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
                {paymentStatuses.map((status) => (
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
