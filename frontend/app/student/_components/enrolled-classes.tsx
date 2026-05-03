"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import EnrolDialog from "./enrol-dialog";
import { EnrolmentWithClassAndTerm, Term } from "@/lib/api/types";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";

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
    fetchEnrolments();
  }, [studentId]);

  const getTermsWhereEnrolled = (enrolments: EnrolmentWithClassAndTerm[]) => {
    const uniqueTermsMap: Record<string, Term> = {};
    enrolments.forEach((enrolment) => {
      const term = enrolment.Term;
      if (!uniqueTermsMap[term.term_id]) {
        uniqueTermsMap[term.term_id] = term;
      }
    });
    return Object.values(uniqueTermsMap).sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    );
  };

  const getEnrolmentsForTerm = (
    enrolments: EnrolmentWithClassAndTerm[],
    termId: string,
  ) => {
    return enrolments.filter((enrolment) => enrolment.Term.term_id === termId);
  };

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
      <div className="py-4">
        <div className="flex justify-between">
          <span className="text-xl font-bold">Enrolments</span>
          <Button onClick={() => setIsEnrolDialogOpen(true)}>Enrol</Button>
        </div>
        <div>
          These are the terms where the student has had a least one enrolment.
        </div>
      </div>

      {isPending && <div>Loading enrolments...</div>}
      {!isPending && enrolments.length === 0 && <div>No enrolments found.</div>}
      {getTermsWhereEnrolled(enrolments).length > 0 && (
        <div className="mb-4">
          {getTermsWhereEnrolled(enrolments).map((term) => (
            <div key={term.term_id} className="mb-2">
              <Collapsible className="rounded-md data-[state=open]:bg-muted">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group w-full text-md bg-muted"
                  >
                    {term.year} Term {term.name}
                    <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col p-1">
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
                        {getEnrolmentsForTerm(enrolments, term.term_id).map(
                          (enrolment) => (
                            <TableRow key={enrolment.enrolment_id}>
                              <TableCell>
                                {enrolment.Term.year} Term {enrolment.Term.name}
                              </TableCell>
                              <TableCell>
                                {enrolment.ClassTime.day_of_week}
                              </TableCell>
                              <TableCell>
                                {enrolment.ClassTime.SubjectOffering.grade}
                              </TableCell>
                              <TableCell>
                                {
                                  enrolment.ClassTime.SubjectOffering
                                    .subject_name
                                }
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
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      )}
      {/* {!isPending && enrolments.length > 0 && (
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
      )} */}
    </div>
  );
}
