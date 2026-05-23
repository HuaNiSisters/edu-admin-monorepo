"use client";

import { useCallback, useEffect, useState } from "react";
import PaymentsList from "./_components/payments-list";
import { LoadingBar } from "@/components/loading-bar";
import { PaymentWithDetails, Term } from "@/lib/api/types";
import { paymentService, termService } from "@/lib/services";
import { useAsync } from "@/hooks/use-async";

const PaymentsPage = () => {
  const { run, isPending } = useAsync();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const fetchPaymentsPageData = useCallback(() => {
    run(async () => {
      const [paymentsData, termsData] = await Promise.all([
        paymentService.getPaymentsAsync(),
        termService.getTermsAsync(),
      ]);

      setPayments(paymentsData);
      setTerms(termsData);
    });
  }, [run]);

  useEffect(() => {
    fetchPaymentsPageData();
  }, [fetchPaymentsPageData]);

  return (
    <div className="space-y-6">
      <LoadingBar isLoading={isPending} />
      <PaymentsList payments={payments} terms={terms} />
    </div>
  );
};

export default PaymentsPage;
