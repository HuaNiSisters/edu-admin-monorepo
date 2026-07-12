"use client";

import ReusableTable, {
  ReusableTableColumn,
} from "@/components/_reusable/reusable-table";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import { formatCurrency } from "./payments-columns";

type PaymentsSummaryRow = {
  paymentType: string;
  quantity: number;
  amount: number;
};

type PaymentsSummaryProps = {
  summaryRows: PaymentsSummaryRow[];
};

const PaymentsSummary = ({ summaryRows }: PaymentsSummaryProps) => {
  const columns: ReusableTableColumn<PaymentsSummaryRow>[] = [
    {
      key: "payment_type",
      header: "Payment Type",
      cell: (row) =>
        row.paymentType === "Total"
          ? row.paymentType
          : formatValuesRemoveUnderscores(row.paymentType),
    },
    {
      key: "quantity",
      header: "Total Qty.",
      cell: (row) => row.quantity,
    },
    {
      key: "amount",
      header: "Total Amount",
      cell: (row) => formatCurrency(row.amount),
    },
  ];

  return (
    <div className="space-y-3">
      <ReusableTable
        columns={columns}
        data={summaryRows}
        getRowKey={(row) => row.paymentType}
        containerClassName="max-w-xl"
        rowClassName={(row) => (row.paymentType === "Total" ? "font-medium" : "")}
      />
    </div>
  );
};

export default PaymentsSummary;
