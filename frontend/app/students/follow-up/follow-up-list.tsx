"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { closeFollowUps } from "./actions";

type FollowUpRow = {
  followUpId: number;
  dueDate: string;
  receipt: string | null;
  studentId: string | null;
  studentName: string;
};

const closedColumns: ColumnDef<FollowUpRow>[] = [
  {
    accessorKey: "studentName",
    header: "Student",
    cell: ({ row: { original: { studentId, studentName } } }) =>
      studentId ? (
        <Link href={`/student/${studentId}`} className="font-medium text-blue-600 underline dark:text-blue-400">
          {studentName}
        </Link>
      ) : studentName,
  },
  {
    accessorKey: "dueDate",
    header: "Follow-up Date",
    cell: ({ row: { original: { dueDate } } }) => (
      <time dateTime={dueDate}>{format(parseISO(dueDate), "d MMM yyyy")}</time>
    ),
  },
  {
    accessorKey: "receipt",
    header: "Receipt",
    cell: ({ row }) => row.original.receipt ?? "—",
  },
];

export function FollowUpList({
  rows,
  showCompleted,
  loadFailed,
}: {
  rows: FollowUpRow[];
  showCompleted: boolean;
  loadFailed: boolean;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const selectedCount = rows.filter((row) => selectedIds.has(row.followUpId)).length;

  const openColumns = useMemo<ColumnDef<FollowUpRow>[]>(() => [
    {
      id: "select",
      header: "",
      size: 48,
      enableSorting: false,
      cell: ({ row: { original: { followUpId, studentName } } }) => (
        <Checkbox
          aria-label={`Select follow-up for ${studentName}`}
          checked={selectedIds.has(followUpId)}
          disabled={isClosing}
          onCheckedChange={(checked) => setSelectedIds((current) => {
            const next = new Set(current);
            if (checked === true) next.add(followUpId);
            else next.delete(followUpId);
            return next;
          })}
        />
      ),
    },
    ...closedColumns,
  ], [isClosing, selectedIds]);

  async function closeSelected() {
    const ids = rows.map((row) => row.followUpId).filter((id) => selectedIds.has(id));
    if (ids.length === 0 || isClosing) return;

    setIsClosing(true);
    setCloseError(null);
    try {
      const error = await closeFollowUps(ids);
      if (error) setCloseError(error);
      else setSelectedIds(new Set());
    } catch {
      setCloseError("Unable to close the selected follow-ups. Please try again.");
    } finally {
      setIsClosing(false);
    }
  }

  return (
    <div className="min-w-0 space-y-3 [contain:inline-size]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          aria-label="Follow-up status"
          type="single"
          disabled={isClosing}
          value={showCompleted ? "closed" : "open"}
          onValueChange={(value) => {
            if (value) {
              setSelectedIds(new Set());
              setCloseError(null);
              router.push(value === "closed" ? "/students/follow-up?status=completed" : "/students/follow-up");
            }
          }}
          variant="outline"
        >
          <ToggleGroupItem value="open">Open</ToggleGroupItem>
          <ToggleGroupItem value="closed">Closed</ToggleGroupItem>
        </ToggleGroup>
        {!loadFailed && (
          <div className="flex items-center gap-3">
            {!showCompleted && selectedCount > 0 && (
              <Button size="sm" onClick={() => void closeSelected()} disabled={isClosing}>
                <CheckCircle2 className="mr-2 size-4" />
                {isClosing ? "Closing…" : `Close ${selectedCount} selected`}
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {rows.length} {rows.length === 1 ? "follow-up" : "follow-ups"}
            </span>
          </div>
        )}
      </div>
      {closeError && <p role="alert" className="text-sm text-destructive">{closeError}</p>}
      {loadFailed ? (
        <p role="alert" className="text-sm text-destructive">
          Unable to load follow-ups. Refresh to try again.
        </p>
      ) : (
        <DataTable
          key={showCompleted ? "closed" : "open"}
          columns={showCompleted ? closedColumns : openColumns}
          data={rows}
        />
      )}
    </div>
  );
}
