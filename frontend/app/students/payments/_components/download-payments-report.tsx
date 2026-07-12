import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentWithDetails } from "@/lib/api/types";

const DownloadPaymentsReport = ({
  payments,
}: {
  payments: PaymentWithDetails[];
}) => {
  const handleDownloadReport = () => {
    const headers = [
      "Student",
      "Student Mobile",
      "Parents",
      "Term",
      "Subject",
      "Grade",
      "Location",
      "Day",
      "Amount Paid",
      "Amount Due",
      "Payment Date",
      "Receipt",
      "Status",
      "Payment Type",
      "Notes",
    ];

    const rows = payments.map((payment) => [
      payment.student_name,
      payment.student_mobile,
      payment.parents,
      payment.term_label,
      payment.subject_name,
      payment.grade,
      payment.location,
      payment.day_of_week,
      payment.amount_paid,
      payment.amount_due,
      payment.payment_date,
      payment.receipt,
      payment.status,
      payment.payment_type,
      payment.notes,
    ]);

    const escapeCsvValue = (value: string | number | null) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replaceAll('"', '""')}"`;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "payments-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-end">
      <Button className="gap-2" onClick={handleDownloadReport}>
        <Download className="size-4" />
        Download Report
      </Button>
    </div>
  );
};

export default DownloadPaymentsReport;
