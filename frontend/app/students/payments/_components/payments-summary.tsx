"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  return (
    <div className="space-y-3">
      <div className="max-w-xl overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Type</TableHead>
              <TableHead>Total Qty.</TableHead>
              <TableHead>Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryRows.map((row) => (
              <TableRow
                key={row.paymentType}
                className={row.paymentType === "Total" ? "font-medium" : ""}
              >
                <TableCell>
                  {row.paymentType === "Total"
                    ? row.paymentType
                    : formatValuesRemoveUnderscores(row.paymentType)}
                </TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{formatCurrency(row.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentsSummary;
