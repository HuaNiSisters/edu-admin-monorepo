"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentDialog from "./payment-dialog";
import { EnrolmentWithClassAndTerm, Term } from "@/lib/api/types";

type AddPaymentButtonProps = {
  term: Term;
  enrolments: EnrolmentWithClassAndTerm[];
  onSaved: () => void;
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  label?: string;
};

const AddPaymentButton = ({
  term,
  enrolments,
  onSaved,
  size = "sm",
  className = "gap-2",
  label = "Add Payment",
}: AddPaymentButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PaymentDialog
        term={term}
        enrolments={enrolments}
        isOpen={dialogOpen}
        payment={null}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          setDialogOpen(false);
          onSaved();
        }}
      />
      <Button
        size={size}
        className={className}
        onClick={() => setDialogOpen(true)}
        disabled={enrolments.length === 0}
      >
        <Plus className="size-4" />
        {label}
      </Button>
    </>
  );
};

export default AddPaymentButton;
