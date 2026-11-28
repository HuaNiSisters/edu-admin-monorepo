"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addWeeks, format, parseISO } from "date-fns";
import { toast } from "sonner";
import { ReusableDialog } from "@/components/_reusable/reuseable-dialog";
import { Button } from "@/components/ui/button";
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
  amountPaid: string;
  paymentDate: string;
  followUpNeeded: boolean;
  followUpDate: string;
  useTrialFollowUp: boolean;
  paymentType: PaymentType | "";
  receipt: string;
  notes: string;
};

type PaymentDialogErrors = Partial<
  Record<
    "amountPaid" | "receipt" | "enrolments" | "paymentType" | "followUpDate" | "form",
    string
  >
>;

const toDateInputValue = (date?: string | null) => {
  if (!date) return format(new Date(), "yyyy-MM-dd");
  return new Date(date).toISOString().slice(0, 10);
};

const RequiredMark = () => (
  <span className="text-red-600" aria-hidden="true">
    *
  </span>
);

const PaymentDialog = ({
  term,
  enrolments,
  isOpen,
  payment,
  onClose,
  onSaved,
}: PaymentDialogProps) => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [studentEnrolments, setStudentEnrolments] = useState(enrolments);
  const [availableTerms, setAvailableTerms] = useState<Term[]>([term]);
  const [selectedTermId, setSelectedTermId] = useState(term.term_id);
  const selectedTerm = availableTerms.find(
    (availableTerm) => availableTerm.term_id === selectedTermId,
  );
  const trialFollowUpDate = selectedTerm
    ? format(
        addWeeks(parseISO(selectedTerm.start_date.slice(0, 10)), 5),
        "yyyy-MM-dd",
      )
    : "";
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(() =>
    enrolments.map((enrolment) => enrolment.class_id),
  );

  const selectedEnrolments = useMemo(
    () =>
      enrolments.filter((enrolment) =>
        selectedClassIds.includes(enrolment.class_id),
      ),
    [enrolments, selectedClassIds],
  );

  const calculatedAmountDue = useMemo(
    () =>
      selectedEnrolments.reduce(
        (total, enrolment) =>
          total + Number(enrolment.ClassTime.SubjectOffering.price_per_term),
        0,
      ),
    [selectedEnrolments],
  );

  const paymentAnchorEnrolmentId = useMemo(
    () => payment?.enrolment_id ?? selectedEnrolments[0]?.enrolment_id,
    [payment, selectedEnrolments],
  );

  const [formState, setFormState] = useState<PaymentFormState>({
    amountPaid: "",
    paymentDate: toDateInputValue(),
    followUpNeeded: false,
    followUpDate: "",
    useTrialFollowUp: false,
    paymentType: "",
    receipt: "",
    notes: "",
  });
  const followUpDate = formState.useTrialFollowUp
    ? trialFollowUpDate
    : formState.followUpDate;
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<PaymentDialogErrors>({});

  useEffect(() => {
    if (!isOpen) return;

    const initialClassIds = enrolments.map((enrolment) => enrolment.class_id);
    setStudentEnrolments(enrolments);
    setAvailableTerms([term]);
    setSelectedTermId(term.term_id);
    setSelectedClassIds(initialClassIds);
    setErrors({});

    const studentId = enrolments[0]?.student_id;
    if (!studentId) return;

    const fetchStudentPaymentOptions = async () => {
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
              .map((availableTerm) => [availableTerm.term_id, availableTerm]),
          ).values(),
        ),
      );
    };

    fetchStudentPaymentOptions();
  }, [enrolments, isOpen, term]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPaymentOptions = async () => {
      const types = await paymentService.getPaymentTypesAsync();
      setPaymentTypes(types);
    };

    fetchPaymentOptions();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const defaultPaymentType = payment?.payment_type ?? paymentTypes[0] ?? "";
    setFormState({
      amountPaid: String(payment?.amount_paid ?? ""),
      paymentDate: toDateInputValue(payment?.payment_date),
      followUpNeeded: Boolean(payment?.follow_up_date),
      followUpDate: payment?.follow_up_date ?? "",
      useTrialFollowUp: false,
      paymentType: defaultPaymentType,
      receipt: payment?.receipt ?? "",
      notes: payment?.notes ?? "",
    });
  }, [isOpen, payment, paymentTypes]);

  const selectTerm = (termId: string) => {
    setSelectedTermId(termId);
    setSelectedClassIds(enrolments.map((enrolment) => enrolment.class_id));
    setErrors((current) => ({ ...current, form: undefined }));
  };

  const toggleEnrolment = (classId: string, isSelected: boolean) => {
    setSelectedClassIds((current) =>
      isSelected
        ? [...new Set([...current, classId])]
        : current.filter((id) => id !== classId),
    );
    setErrors((current) => ({ ...current, enrolments: undefined }));
  };

  const updateField = <TKey extends keyof PaymentFormState>(
    key: TKey,
    value: PaymentFormState[TKey],
  ) => {
    setFormState((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  const handleConfirm = async () => {
    const amountPaid = Number(formState.amountPaid);
    const amountDue = Number(payment?.amount_due ?? calculatedAmountDue);
    const nextErrors: PaymentDialogErrors = {};

    if (!formState.amountPaid.trim()) {
      nextErrors.amountPaid = "Amount paid is required.";
    } else if (!Number.isFinite(amountPaid) || amountPaid < 0) {
      nextErrors.amountPaid = "Amount paid must be a valid number.";
    }

    if (!formState.receipt.trim()) {
      nextErrors.receipt = "Receipt/reference is required.";
    }

    if (selectedEnrolments.length === 0) {
      nextErrors.enrolments = "Select at least one enrolment to pay for.";
    }

    if (!formState.paymentType) {
      nextErrors.paymentType = "Payment type is required.";
    }

    if (formState.followUpNeeded && !followUpDate) {
      nextErrors.followUpDate = "Follow-up date is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    let paymentEnrolmentId = paymentAnchorEnrolmentId;

    if (!payment) {
      try {
        const targetEnrolments = await Promise.all(
          selectedEnrolments.map(async (enrolment) => {
            const existingEnrolment = studentEnrolments.find(
              (existing) =>
                existing.term_id === selectedTermId &&
                existing.class_id === enrolment.class_id,
            );
            if (existingEnrolment) return existingEnrolment;

            return enrolmentService.enrolAsync({
              studentId: enrolment.student_id,
              classId: enrolment.class_id,
              termId: selectedTermId,
              classStartDate: selectedTerm?.start_date,
            });
          }),
        );
        paymentEnrolmentId = targetEnrolments[0]?.enrolment_id;
      } catch (error) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Failed to create term enrolments.",
        });
        return;
      }
    }

    if (!paymentEnrolmentId) {
      setErrors({ form: "Unable to create an enrolment for this payment." });
      return;
    }

    const paymentData = {
      enrolment_id: paymentEnrolmentId,
      amount_due: amountDue,
      amount_paid: amountPaid,
      payment_date: formState.paymentDate
        ? new Date(formState.paymentDate).toISOString()
        : null,
      follow_up_date: formState.followUpNeeded ? followUpDate : null,
      payment_type: formState.paymentType as PaymentType,
      status: (amountPaid <= 0
        ? "unpaid"
        : amountPaid >= amountDue
          ? "paid"
          : "partial") as PaymentStatus,
      receipt: formState.receipt.trim(),
      notes: formState.notes.trim() || null,
    };

    try {
      if (payment) {
        await paymentService.updatePaymentAsync(
          payment.payment_id,
          paymentData,
        );
        toast.success("Payment updated.");
      } else {
        await paymentService.createPaymentAsync(paymentData);
        toast.success("Payment added.");
      }
    } catch (error) {
      setErrors({
        form:
          error instanceof Error ? error.message : "Failed to save payment.",
      });
      return;
    }

    onSaved();
    onClose();
  };

  const savePayment = async () => {
    if (saving.current) return;
    saving.current = true;
    setIsSaving(true);
    try {
      await handleConfirm();
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      title={payment ? "Edit payment" : "Add payment"}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={savePayment}
      confirmDisabled={isSaving}
      contentClassName="max-h-[90dvh] overflow-y-auto"
      confirmText={payment ? "Save Payment" : "Add Payment"}
    >
      <div className="grid gap-4">
        {errors.form && (
          <p className="text-sm text-red-600" role="alert">
            {errors.form}
          </p>
        )}
        <div className="grid gap-2">
          <Label>
            Term <RequiredMark />
          </Label>
          <Select
            value={selectedTermId}
            onValueChange={selectTerm}
            disabled={Boolean(payment)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTerms.map((availableTerm) => (
                <SelectItem
                  key={availableTerm.term_id}
                  value={availableTerm.term_id}
                >
                  {availableTerm.year} Term {availableTerm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!payment && (
            <p className="text-xs text-muted-foreground">
              Saving for a future term enrols the selected classes in that term.
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label>
            Enrolments <RequiredMark />
          </Label>
          <div
            className={`rounded-md border divide-y ${errors.enrolments ? "border-destructive" : ""}`}
          >
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
          {errors.enrolments && (
            <p className="text-sm text-red-600" role="alert">
              {errors.enrolments}
            </p>
          )}
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="amount_paid">
              Amount Paid <RequiredMark />
            </Label>
            <Input
              id="amount_paid"
              type="number"
              min="0"
              step="0.01"
              value={formState.amountPaid}
              aria-invalid={Boolean(errors.amountPaid)}
              onChange={(event) =>
                updateField("amountPaid", event.target.value)
              }
            />
            {errors.amountPaid && (
              <p className="text-sm text-red-600" role="alert">
                {errors.amountPaid}
              </p>
            )}
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
            <Label>
              Payment Type <RequiredMark />
            </Label>
            <Select
              value={formState.paymentType}
              onValueChange={(value: PaymentType) =>
                updateField("paymentType", value)
              }
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={Boolean(errors.paymentType)}
              >
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
            {errors.paymentType && (
              <p className="text-sm text-red-600" role="alert">
                {errors.paymentType}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="receipt">
              Receipt / Reference <RequiredMark />
            </Label>
            <Input
              id="receipt"
              value={formState.receipt}
              aria-invalid={Boolean(errors.receipt)}
              onChange={(event) => updateField("receipt", event.target.value)}
            />
            {errors.receipt && (
              <p className="text-sm text-red-600" role="alert">
                {errors.receipt}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="follow_up_needed"
            checked={formState.followUpNeeded}
            onCheckedChange={(checked) => {
              updateField("followUpNeeded", checked === true);
              setErrors((current) => ({ ...current, followUpDate: undefined }));
            }}
          />
          <Label htmlFor="follow_up_needed">Follow-up needed</Label>
        </div>

        {formState.followUpNeeded && (
          <div className="grid gap-2">
            <Label htmlFor="follow_up_date">
              Follow-up Date <RequiredMark />
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="follow_up_date"
                type="date"
                className="w-auto"
                required
                value={followUpDate}
                aria-invalid={Boolean(errors.followUpDate)}
                aria-describedby={errors.followUpDate ? "follow_up_date_error" : undefined}
                onChange={(event) => {
                  updateField("followUpDate", event.target.value);
                  updateField("useTrialFollowUp", false);
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!trialFollowUpDate}
                onClick={() => {
                  updateField("useTrialFollowUp", true);
                  setErrors((current) => ({ ...current, followUpDate: undefined }));
                }}
              >
                5-week trial
              </Button>
            </div>
            {errors.followUpDate && (
              <p id="follow_up_date_error" className="text-sm text-red-600" role="alert">
                {errors.followUpDate}
              </p>
            )}
          </div>
        )}

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
