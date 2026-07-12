"use client";

import { useMemo, useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { X } from "lucide-react";
import { PaymentWithDetails, Term } from "@/lib/api/types";
import { createPaymentColumns } from "./payments-columns";
import PaymentSummary from "./payments-summary";
import FilterContent from "@/components/filter-content";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import DownloadPaymentsReport from "./download-payments-report";

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type PaymentsListProps = {
  payments: PaymentWithDetails[];
  terms: Term[];
};

const getFilterValue = (filters: ColumnFiltersState, id: string) =>
  filters.find((filter) => filter.id === id)?.value as string | undefined;

const PaymentsList = ({ payments, terms }: PaymentsListProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState("");

  const columns = useMemo(() => createPaymentColumns(), []);

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

  const locationOptions = useMemo(
    () => [...new Set(payments.map((payment) => payment.location))].sort(),
    [payments],
  );

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

  const summaryPayments = useMemo(() => {
    const term = getFilterValue(columnFilters, "term_label");
    const location = getFilterValue(columnFilters, "location");
    const day = getFilterValue(columnFilters, "day_of_week");
    const grade = getFilterValue(columnFilters, "grade");
    const subject = getFilterValue(columnFilters, "subject_name");
    const type = getFilterValue(columnFilters, "payment_type");
    const status = getFilterValue(columnFilters, "status");

    return searchedPayments.filter((payment) => {
      if (term && payment.term_label !== term) return false;
      if (location && payment.location !== location) return false;
      if (day && payment.day_of_week !== day) return false;
      if (grade && String(payment.grade) !== grade) return false;
      if (subject && payment.subject_name !== subject) return false;
      if (type && payment.payment_type !== type) return false;
      if (status && payment.status !== status) return false;
      return true;
    });
  }, [columnFilters, searchedPayments]);

  const paymentSummary = useMemo(() => {
    const rows = paymentTypeOptions.map((paymentType) => {
      const matchingPayments = summaryPayments.filter(
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
        quantity: summaryPayments.length,
        amount: summaryPayments.reduce(
          (total, payment) => total + payment.amount_paid,
          0,
        ),
      },
    ];
  }, [paymentTypeOptions, summaryPayments]);

  const hasActiveFilters = columnFilters.length > 0 || searchValue.length > 0;

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
          filterName="Locations"
          placeholderName="Location"
          options={locationOptions}
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

        <DownloadPaymentsReport payments={summaryPayments} />

        <div className="flex justify-end">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => {
                setColumnFilters([]);
                setSearchValue("");
              }}
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>

        <PaymentSummary summaryRows={paymentSummary} />
      </div>

      <div className="space-y-3">
        <Input
          className="max-w-md"
          placeholder="Type to filter..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />

        <DataTable
          columns={columns}
          data={summaryPayments}
        />
      </div>
    </div>
  );
};

export default PaymentsList;
