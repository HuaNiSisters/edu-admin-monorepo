"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import EnrolDialog from "./enrol-dialog";
import {
  EnrolmentWithClassAndTerm,
  PaymentWithDetails,
  Term,
} from "@/lib/api/types";
import { enrolmentService, paymentService } from "@/lib/services";
import { useAsync } from "@/hooks/use-async";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import TermPaymentsTable from "./term-payments-table";

interface EnrolledClassesProps {
  studentId: string;
}

export default function EnrolledClasses({ studentId }: EnrolledClassesProps) {
  const [isEnrolDialogOpen, setIsEnrolDialogOpen] = useState(false);
  const [enrolments, setEnrolments] = useState<EnrolmentWithClassAndTerm[]>([]);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);

  const { run, isPending } = useAsync();

  const fetchEnrolments = useCallback(async () => {
    const [fetchedEnrolments, fetchedPayments] = await Promise.all([
      enrolmentService.getEnrolmentsByStudentIdAsync(studentId),
      paymentService.getPaymentsByStudentIdAsync(studentId),
    ]);
    console.log({ fetchedEnrolments });
    setEnrolments(fetchedEnrolments);
    setPayments(fetchedPayments);
  }, [studentId]);

  useEffect(() => {
    fetchEnrolments();
  }, [fetchEnrolments]);

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

  const getPaymentsForTerm = (termId: string) => {
    return payments.filter((payment) => payment.term_id === termId);
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
      </div>

      {isPending && <div>Loading enrolments...</div>}
      {!isPending && enrolments.length === 0 && <div>No enrolments found.</div>}
      {getTermsWhereEnrolled(enrolments).length > 0 && (
        <div className="mb-4">
          {getTermsWhereEnrolled(enrolments).map((term) => {
            const termEnrolments = getEnrolmentsForTerm(
              enrolments,
              term.term_id,
            );

            return (
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
                      <TermPaymentsTable
                        term={term}
                        enrolments={termEnrolments}
                        payments={getPaymentsForTerm(term.term_id)}
                        onChange={() => run(fetchEnrolments)}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
