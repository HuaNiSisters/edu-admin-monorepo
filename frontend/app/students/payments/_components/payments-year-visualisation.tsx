"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Landmark, WalletCards } from "lucide-react";
import { PaymentWithDetails, Term } from "@/lib/api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const getPaymentYear = (payment: PaymentWithDetails) => {
  if (payment.payment_date) {
    return new Date(payment.payment_date).getFullYear();
  }

  return payment.term_year;
};

type PaymentsYearVisualisationProps = {
  payments: PaymentWithDetails[];
  terms: Term[];
};

const PaymentsYearVisualisation = ({
  payments,
  terms,
}: PaymentsYearVisualisationProps) => {
  const yearOptions = useMemo(() => {
    const years = [
      ...new Set([
        ...payments.map(getPaymentYear).filter(Boolean),
        ...terms.map((term) => term.year),
      ]),
    ].sort((a, b) => b - a);

    return years;
  }, [payments, terms]);

  const [selectedYear, setSelectedYear] = useState<string>(
    String(yearOptions[0] ?? new Date().getFullYear()),
  );

  useEffect(() => {
    if (!yearOptions.length) return;
    if (yearOptions.includes(Number(selectedYear))) return;
    setSelectedYear(String(yearOptions[0]));
  }, [selectedYear, yearOptions]);

  const selectedYearNumber = Number(selectedYear);

  const yearPayments = useMemo(
    () =>
      payments.filter((payment) => getPaymentYear(payment) === selectedYearNumber),
    [payments, selectedYearNumber],
  );

  const totals = useMemo(() => {
    const byType = yearPayments.reduce(
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
      count: yearPayments.length,
    };
  }, [yearPayments]);

  const statRows = [
    {
      type: "cash",
      label: "Cash",
      amount: totals.byType.cash,
      icon: Banknote,
      className: "bg-emerald-600",
    },
    {
      type: "bank_transfer",
      label: "Bank Transfer",
      amount: totals.byType.bank_transfer,
      icon: Landmark,
      className: "bg-blue-600",
    },
    {
      type: "other",
      label: "Other",
      amount: totals.byType.other,
      icon: WalletCards,
      className: "bg-slate-500",
    },
  ];

  return (
    <section className="space-y-4 rounded-md border bg-primary-foreground p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-normal">
            Yearly Payments
          </h2>
          <p className="text-sm text-muted-foreground">
            Total payments received by payment type.
          </p>
        </div>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
          const percentage =
            totals.total > 0 ? Math.round((row.amount / totals.total) * 100) : 0;
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
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${row.className}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {percentage}% of yearly payments
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {statRows.map((row) => {
          const percentage =
            totals.total > 0 ? Math.round((row.amount / totals.total) * 100) : 0;

          return (
            <div key={row.type} className="grid gap-2 sm:grid-cols-[140px_1fr_90px]">
              <div className="text-sm font-medium">
                {formatValuesRemoveUnderscores(row.type)}
              </div>
              <div className="h-8 overflow-hidden rounded-md bg-muted">
                <div
                  className={`flex h-full items-center px-3 text-xs font-medium text-white ${row.className}`}
                  style={{ width: `${percentage}%`, minWidth: percentage ? 36 : 0 }}
                >
                  {percentage > 0 ? `${percentage}%` : ""}
                </div>
              </div>
              <div className="text-right text-sm font-medium">
                {formatCurrency(row.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PaymentsYearVisualisation;
