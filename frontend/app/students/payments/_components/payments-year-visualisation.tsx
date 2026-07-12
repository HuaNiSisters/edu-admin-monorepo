"use client";

import { useMemo } from "react";
import { Banknote, Landmark, WalletCards } from "lucide-react";
import { PaymentWithDetails } from "@/lib/api/types";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

type PaymentsYearVisualisationProps = {
  payments: PaymentWithDetails[];
};

const PaymentsYearVisualisation = ({
  payments,
}: PaymentsYearVisualisationProps) => {
  const totals = useMemo(() => {
    const byType = payments.reduce(
      (summary, payment) => {
        summary[payment.payment_type] += Number(payment.amount_paid ?? 0);
        return summary;
      },
      {
        cash: 0,
        bank_transfer: 0,
        other: 0,
      },
    );

    const total = byType.cash + byType.bank_transfer + byType.other;

    return {
      byType,
      total,
      count: payments.length,
    };
  }, [payments]);

  const statRows = [
    {
      type: "cash",
      label: "Cash",
      amount: totals.byType.cash,
      icon: Banknote,
    },
    {
      type: "bank_transfer",
      label: "Bank Transfer",
      amount: totals.byType.bank_transfer,
      icon: Landmark,
    },
    {
      type: "other",
      label: "Other",
      amount: totals.byType.other,
      icon: WalletCards,
    },
  ];

  return (
    <section className="space-y-4 rounded-md border bg-primary-foreground p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-md border p-3">
          <div className="text-sm text-muted-foreground">Total received</div>
          <div className="mt-2 text-2xl font-semibold">
            {formatCurrency(totals.total)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {totals.count} payment{totals.count === 1 ? "" : "s"}
          </div>
        </div>

        {statRows.map((row) => {
          const numberOfPayments = payments.filter(
            (payment) => payment.payment_type === row.type,
          ).length;

          const percentage =
            totals.total > 0
              ? Math.round((row.amount / totals.total) * 100)
              : 0;

          const Icon = row.icon;

          return (
            <div key={row.type} className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4" />
                {row.label}
              </div>
              <div className="mt-2 text-xl font-semibold">
                {formatCurrency(row.amount)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {numberOfPayments} payments · {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PaymentsYearVisualisation;
