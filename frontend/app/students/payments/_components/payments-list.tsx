"use client";

import { useMemo, useState } from "react";
import { VisibilityState } from "@tanstack/react-table";
import { PaymentWithDetails } from "@/lib/api/types";
import { createPaymentColumns } from "./payments-columns";
import { DataTable } from "@/components/ui/data-table";
import { PaymentFilters } from "./use-payment-filters";

type PaymentsListProps = {
  payments: PaymentWithDetails[];
  paymentFilters: PaymentFilters;
};

const PaymentsList = ({ payments, paymentFilters }: PaymentsListProps) => {
  const {
    columnFilters,
    setColumnFilters,
    searchedPayments,
    filteredPayments,
  } = paymentFilters;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    grade: false,
    day_of_week: false,
  });

  const columns = useMemo(() => createPaymentColumns(), []);

  const paymentTypeOptions = useMemo(
    () => [...new Set(payments.map((payment) => payment.payment_type))].sort(),
    [payments],
  );

  const paymentSummary = useMemo(() => {
    const rows = paymentTypeOptions.map((paymentType) => {
      const matchingPayments = filteredPayments.filter(
        (payment) => payment.payment_type === paymentType,
      );

      return {
        paymentType,
        quantity: matchingPayments.length,
        amount: matchingPayments.reduce(
          (total, payment) => total + payment.amount_paid,
          0,
        ),
      };
    });

    return [
      ...rows,
      {
        paymentType: "Total",
        quantity: filteredPayments.length,
        amount: filteredPayments.reduce(
          (total, payment) => total + payment.amount_paid,
          0,
        ),
      },
    ];
  }, [paymentTypeOptions, filteredPayments]);

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={searchedPayments}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
      />
    </div>
  );
};

export default PaymentsList;
