"use client";

import { useMemo } from "react";
import { PaymentWithDetails } from "@/lib/api/types";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const LOCATION_COLORS = [
  "bg-teal-500",
  "bg-indigo-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-violet-500",
];

type PaymentsLocationBreakdownProps = {
  payments: PaymentWithDetails[];
};

const PaymentsLocationBreakdown = ({
  payments,
}: PaymentsLocationBreakdownProps) => {
  const locationOptions = useMemo(
    () =>
      [...new Set(payments.map((payment) => payment.location))]
        .filter(Boolean)
        .sort(),
    [payments],
  );

  const locationRows = useMemo(
    () =>
      locationOptions.map((location) => {
        const locationPayments = payments.filter(
          (payment) => payment.location === location,
        );

        return {
          location,
          amount: locationPayments.reduce(
            (total, payment) => total + Number(payment.amount_paid ?? 0),
            0,
          ),
          count: locationPayments.length,
        };
      }),
    [locationOptions, payments],
  );

  const locationTotal = locationRows.reduce((sum, row) => sum + row.amount, 0);

  const locationSegments = useMemo(
    () =>
      locationRows
        .map((row, index) => ({
          ...row,
          percentage:
            locationTotal > 0 ? (row.amount / locationTotal) * 100 : 0,
          colorClass: LOCATION_COLORS[index % LOCATION_COLORS.length],
        }))
        .sort((a, b) => b.amount - a.amount),
    [locationRows, locationTotal],
  );

  if (locationSegments.length === 0) {
    return (
      <section className="rounded-md border bg-primary-foreground p-4">
        <h3 className="text-sm font-semibold">Location Breakdown</h3>
        <div className="mt-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No payments found for the current filters.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-md border bg-primary-foreground p-4">
      <h3 className="text-sm font-semibold">Location Breakdown</h3>

      <div className="flex h-3 w-full gap-1">
        {locationSegments.map((segment) => (
          <div
            key={segment.location}
            className={`h-full rounded-full ${segment.colorClass} transition-all`}
            style={{ width: `${segment.percentage}%` }}
            title={`${formatValuesRemoveUnderscores(segment.location)}: ${formatCurrency(segment.amount)} (${Math.round(segment.percentage)}%)`}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {locationSegments.map((segment) => (
          <div
            key={segment.location}
            className="flex items-center gap-1.5 text-xs"
          >
            <span
              className={`size-2 shrink-0 rounded-full ${segment.colorClass}`}
            />
            <span className="font-medium">
              {formatValuesRemoveUnderscores(segment.location)}
            </span>
            <span className="text-muted-foreground">
              {formatCurrency(segment.amount)} ·{" "}
              {Math.round(segment.percentage)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PaymentsLocationBreakdown;
