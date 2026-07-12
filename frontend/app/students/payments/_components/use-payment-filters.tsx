"use client";

import { useMemo, useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { PaymentWithDetails } from "@/lib/api/types";

export const usePaymentFilters = (payments: PaymentWithDetails[]) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState("");

  const searchedPayments = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return payments;

    return payments.filter((payment) =>
      [
        payment.student_name,
        payment.student_mobile,
        payment.parents,
        payment.term_label,
        payment.subject_name,
        payment.receipt,
        payment.status,
        payment.payment_type,
        payment.notes ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [payments, searchValue]);

  // Generic column-filter application — mirrors each column's own filterFn
  // (arrIncludesSome + string coercion) instead of hardcoding a branch per field.
  const filteredPayments = useMemo(() => {
    if (columnFilters.length === 0) return searchedPayments;
    return searchedPayments.filter((payment) =>
      columnFilters.every((filter) => {
        const selected = filter.value as string[];
        if (!selected?.length) return true;
        const rawValue = payment[filter.id as keyof PaymentWithDetails];
        return selected.includes(String(rawValue ?? ""));
      }),
    );
  }, [columnFilters, searchedPayments]);

  const hasActiveFilters = columnFilters.length > 0 || searchValue.length > 0;

  const clearFilters = () => {
    setColumnFilters([]);
    setSearchValue("");
  };

  return {
    columnFilters,
    setColumnFilters,
    searchValue,
    setSearchValue,
    searchedPayments,
    filteredPayments,
    hasActiveFilters,
    clearFilters,
  };
};

export type PaymentFilters = ReturnType<typeof usePaymentFilters>;
