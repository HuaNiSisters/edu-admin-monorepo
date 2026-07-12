"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReusableTableColumn<TData> = {
  key: string;
  header: ReactNode;
  cell: (row: TData) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type ReusableTableProps<TData> = {
  columns: ReusableTableColumn<TData>[];
  data: TData[];
  getRowKey: (row: TData, index: number) => string | number;
  emptyMessage?: ReactNode;
  containerClassName?: string;
  rowClassName?: string | ((row: TData) => string);
  emptyCellClassName?: string;
};

const ReusableTable = <TData,>({
  columns,
  data,
  getRowKey,
  emptyMessage = "No results.",
  containerClassName,
  rowClassName,
  emptyCellClassName,
}: ReusableTableProps<TData>) => {
  const getRowClassName = (row: TData) =>
    typeof rowClassName === "function" ? rowClassName(row) : rowClassName;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-primary-foreground",
        containerClassName,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={cn(
                  "h-16 text-center text-muted-foreground",
                  emptyCellClassName,
                )}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={getRowKey(row, index)} className={getRowClassName(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReusableTable;
export type { ReusableTableColumn };
