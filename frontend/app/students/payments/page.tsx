"use client";

import { useCallback, useEffect, useState } from "react";
import PaymentsFilters from "./_components/payments-filters";
import PaymentsList from "./_components/payments-list";
import PaymentsYearVisualisation from "./_components/payments-year-visualisation";
import { LoadingBar } from "@/components/loading-bar";
import { PaymentWithDetails, Term } from "@/lib/api/types";
import { paymentService, termService } from "@/lib/services";
import { useAsync } from "@/hooks/use-async";
import { usePaymentFilters } from "./_components/use-payment-filters";
import PaymentsPerLocation from "./_components/payments-location-breakdown";

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

  const paymentFilters = usePaymentFilters(payments);

  return (
    <div className="space-y-6">
      <LoadingBar isLoading={isPending} />

      <PaymentsPerLocation payments={payments} />
      <hr></hr>

      <PaymentsFilters
        payments={payments}
        terms={terms}
        paymentFilters={paymentFilters}
      />

      <PaymentsYearVisualisation
        payments={paymentFilters.filteredPayments}
        terms={terms}
      />

      <PaymentsList payments={payments} paymentFilters={paymentFilters} />
    </div>
  );
};

export default PaymentsPage;
