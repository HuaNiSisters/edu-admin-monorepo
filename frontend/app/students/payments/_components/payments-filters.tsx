"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { PaymentWithDetails, Term } from "@/lib/api/types";
import FilterContent from "@/components/filter-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DownloadPaymentsReport from "./download-payments-report";
import { PaymentFilters } from "./use-payment-filters";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type PaymentsFiltersProps = {
  payments: PaymentWithDetails[];
  terms: Term[];
  paymentFilters: PaymentFilters;
};

const PaymentsFilters = ({
  payments,
  terms,
  paymentFilters,
}: PaymentsFiltersProps) => {
  const {
    columnFilters,
    setColumnFilters,
    searchValue,
    setSearchValue,
    filteredPayments,
    hasActiveFilters,
    clearFilters,
  } = paymentFilters;

  const termOptions = useMemo(() => {
    const labelsFromTerms = terms
      .map((term) => `Term ${term.name} ${term.year}`)
      .sort((a, b) => {
        const [, aTerm, aYear] = a.split(" ");
        const [, bTerm, bYear] = b.split(" ");
        return Number(aYear) - Number(bYear) || Number(aTerm) - Number(bTerm);
      });

    return labelsFromTerms.length
      ? labelsFromTerms
      : [...new Set(payments.map((payment) => payment.term_label))].sort();
  }, [payments, terms]);

  const dayOptions = useMemo(
    () =>
      DAY_ORDER.filter((day) =>
        payments.some((payment) => payment.day_of_week === day),
      ),
    [payments],
  );

  const gradeOptions = useMemo(
    () =>
      [...new Set(payments.map((payment) => String(payment.grade)))]
        .filter((grade) => grade !== "0")
        .sort((a, b) => Number(a) - Number(b)),
    [payments],
  );

  const subjectOptions = useMemo(
    () =>
      [
        ...new Set(
          payments.map((payment) => payment.subject_name).filter(Boolean),
        ),
      ].sort(),
    [payments],
  );

  const paymentTypeOptions = useMemo(
    () => [...new Set(payments.map((payment) => payment.payment_type))].sort(),
    [payments],
  );

  const paymentStatusOptions = useMemo(
    () => [...new Set(payments.map((payment) => payment.status))].sort(),
    [payments],
  );

  const locationOptions = useMemo(
    () => [...new Set(payments.map((payment) => payment.location))].sort(),
    [payments],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterContent
          filterValue="term_label"
          filterName="Terms"
          placeholderName="Term"
          options={termOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <FilterContent
          filterValue="location"
          filterName="Campuses"
          placeholderName="Campus"
          options={locationOptions}
          formatOption={formatValuesRemoveUnderscores}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <FilterContent
          filterValue="day_of_week"
          filterName="Days"
          placeholderName="Day"
          options={dayOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <FilterContent
          filterValue="grade"
          filterName="Grades"
          placeholderName="Grade"
          options={gradeOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <FilterContent
          filterValue="subject_name"
          filterName="Subjects"
          placeholderName="Subject"
          options={subjectOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <FilterContent
          filterValue="payment_type"
          filterName="Payment Types"
          placeholderName="Payment Type"
          options={paymentTypeOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <FilterContent
          filterValue="status"
          filterName="Payment Statuses"
          placeholderName="Payment Status"
          options={paymentStatusOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <DownloadPaymentsReport payments={filteredPayments} />

        <div className="flex justify-end">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <Input
        className="max-w-md"
        placeholder="Type to filter..."
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
      />
    </div>
  );
};

export default PaymentsFilters;
