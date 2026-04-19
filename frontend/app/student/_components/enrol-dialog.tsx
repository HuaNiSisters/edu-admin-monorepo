"use client";

import { useEffect, useRef } from "react";
import { ReusableDialog } from "@/components/_reusable/reuseable-dialog";
import EnrolDataForm, {
  EnrolmentData,
  EnrolDataFormHandle,
} from "./enrol-data-form";

interface EnrolDialogProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EnrolDialog({
  studentId,
  isOpen,
  onClose,
}: EnrolDialogProps) {
  const formRef = useRef<EnrolDataFormHandle>(null);
  const handleConfirm = () => {
    formRef.current?.submit();
  };

  const handleFormSubmit = (data: EnrolmentData) => {
    // call your API, close the dialog, etc.
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      title="Enrol in a class"
      onClose={onClose}
      onCancel={onClose}
      onConfirm={handleConfirm}
    >
      <EnrolDataForm
        studentId={studentId}
        onSubmit={handleFormSubmit}
        ref={formRef}
      ></EnrolDataForm>
    </ReusableDialog>
  );
}
