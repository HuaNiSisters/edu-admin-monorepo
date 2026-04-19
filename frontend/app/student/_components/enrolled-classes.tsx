"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import EnrolDialog from "./enrol-dialog";

interface EnrolledClassesProps {
  studentId: string;
}

export default function EnrolledClasses({ studentId }: EnrolledClassesProps) {
  const [isEnrolDialogOpen, setIsEnrolDialogOpen] = useState(false);

  return (
    <div>
      <EnrolDialog
        studentId={studentId}
        isOpen={isEnrolDialogOpen}
        onClose={() => setIsEnrolDialogOpen(false)}
      />
      <span className="text-xl font-bold">Enrolments</span>{" "}
      <Button onClick={() => setIsEnrolDialogOpen(true)}>Enrol</Button>
      <br />
      these are the student's enrolled classes for student ID: {studentId}
    </div>
  );
}
