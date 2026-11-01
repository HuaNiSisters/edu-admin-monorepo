"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ReusableDialog } from "@/components/_reusable/reuseable-dialog";
import EnrolDataForm, { EnrolDataFormHandle } from "./enrol-data-form";

interface EnrolInClassProps {
  studentId?: string;
  isOpen: boolean;
  defaultValues?: {
    classId?: string;
    termId?: string;
    classStartDate?: string;
  };
  confirmText?: string;
  onEnrol?: (data: {
    classId: string;
    termId: string;
    classStartDate: string;
  }) => Promise<void> | void;
  onOpen: () => void;
  onClose: () => void;
  afterSubmit?: () => void;
}

export default function EnrolInClass({
  studentId,
  isOpen,
  defaultValues,
  confirmText = "Add class",
  onEnrol,
  onOpen,
  onClose,
  afterSubmit,
}: EnrolInClassProps) {
  const formRef = useRef<EnrolDataFormHandle>(null);

  return (
    <>
      <Button type="button" onClick={onOpen}>
        Enrol in Class
      </Button>
      <ReusableDialog
        isOpen={isOpen}
        title="Enrol in a class"
        onClose={onClose}
        onCancel={onClose}
        onConfirm={() => formRef.current?.submit()}
        confirmText={confirmText}
        contentClassName="sm:max-w-3xl"
      >
        {isOpen && (
          <EnrolDataForm
            key={`${defaultValues?.classId ?? "new"}-${defaultValues?.termId ?? ""}-${defaultValues?.classStartDate ?? ""}`}
            studentId={studentId}
            defaultValues={defaultValues}
            onEnrol={onEnrol}
            afterSubmit={afterSubmit ?? onClose}
            ref={formRef}
          />
        )}
      </ReusableDialog>
    </>
  );
}
