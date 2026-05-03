"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import EnrolDialog from "./enrol-dialog";
import { EnrolmentWithClassAndTerm } from "@/lib/api/types";
import { enrolmentService } from "@/lib/services";
import { useAsync } from "@/hooks/use-async";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

interface EnrolledClassesProps {
  studentId: string;
}

export default function EnrolledClasses({ studentId }: EnrolledClassesProps) {
  const [isEnrolDialogOpen, setIsEnrolDialogOpen] = useState(false);
  const [enrolments, setEnrolments] = useState<EnrolmentWithClassAndTerm[]>([]);

  const { run, isPending } = useAsync();

  const fetchEnrolments = async () => {
    const fetchedEnrolments =
      await enrolmentService.getEnrolmentsByStudentIdAsync(studentId);
    console.log({ fetchedEnrolments });
    setEnrolments(fetchedEnrolments);
  };

  useEffect(() => {
    run(fetchEnrolments);
  }, [studentId]);

  return (
    <div>
      <EnrolDialog
        studentId={studentId}
        isOpen={isEnrolDialogOpen}
        onClose={() => {
          setIsEnrolDialogOpen(false);
          run(fetchEnrolments);
        }}
      />
      <div className="flex gap-5 py-2 justify-between">
        <span className="text-xl font-bold">Enrolments</span>
        <Button onClick={() => setIsEnrolDialogOpen(true)}>Enrol</Button>
      </div>
      {isPending && <div>Loading enrolments...</div>}
      {!isPending && enrolments.length === 0 && <div>No enrolments found.</div>}
      {!isPending && enrolments.length > 0 && (
        <div className="rounded-md border p-2 bg-primary-foreground">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrolments.map((enrolment) => (
                <TableRow key={enrolment.enrolment_id}>
                  <TableCell>
                    {enrolment.Term.year} Term {enrolment.Term.name}
                  </TableCell>
                  <TableCell>{enrolment.ClassTime.day_of_week}</TableCell>
                  <TableCell>
                    {enrolment.ClassTime.SubjectOffering.grade}
                  </TableCell>
                  <TableCell>
                    {enrolment.ClassTime.SubjectOffering.subject_name}
                  </TableCell>
                  <TableCell>
                    {enrolment.ClassTime.start_time} -{" "}
                    {enrolment.ClassTime.end_time}
                  </TableCell>
                  <TableCell>
                    {formatValuesRemoveUnderscores(
                      enrolment.ClassTime.SubjectOffering.location,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
