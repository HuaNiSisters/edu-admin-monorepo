"use client";

import { useMemo, useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { StudentOwing } from "@/lib/api/types/owing";
import FilterContent from "@/components/filter-content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import { createOwingColumns, OWING_SMS_TEMPLATES } from "./owings-columns";

export default function OwingsList({ owings }: { owings: StudentOwing[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sentByEnrolment, setSentByEnrolment] = useState<
    Record<string, string[]>
  >({});
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const allSelected = owings.length > 0 && selectedIds.size === owings.length;

  const columns = useMemo(
    () =>
      createOwingColumns({
        selectedIds,
        allSelected,
        sentByEnrolment,
        onToggleSelected: (enrolmentId, selected) => {
          setSelectedIds((previous) => {
            const next = new Set(previous);
            if (selected) next.add(enrolmentId);
            else next.delete(enrolmentId);
            return next;
          });
        },
        onToggleAll: (selected) => {
          setSelectedIds(
            selected
              ? new Set(owings.map((owing) => owing.enrolment_id))
              : new Set(),
          );
        },
        onToggleSent: (enrolmentId, template, sent) => {
          setSentByEnrolment((previous) => {
            const current = previous[enrolmentId] ?? [];
            const next = sent
              ? [...new Set([...current, template])]
              : current.filter((item) => item !== template);
            return { ...previous, [enrolmentId]: next };
          });
        },
      }),
    [allSelected, owings, selectedIds, sentByEnrolment],
  );

  const termOptions = useMemo(
    () => [...new Set(owings.map((owing) => owing.term_label))].sort(),
    [owings],
  );
  const gradeOptions = useMemo(
    () =>
      [...new Set(owings.map((owing) => String(owing.grade)))].sort(
        (a, b) => Number(a) - Number(b),
      ),
    [owings],
  );
  const subjectOptions = useMemo(
    () => [...new Set(owings.map((owing) => owing.subject_name))].sort(),
    [owings],
  );
  const locationOptions = useMemo(
    () =>
      [
        ...new Set(
          owings.map((owing) => formatValuesRemoveUnderscores(owing.location)),
        ),
      ].sort(),
    [owings],
  );
  const hasActiveFilters = columnFilters.length > 0;
  const searchValue =
    (columnFilters.find((filter) => filter.id === "student_name")
      ?.value as string) ?? "";

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setSendDialogOpen(true)}>Send message</Button>
      </div>
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
          filterValue="location"
          filterName="Locations"
          placeholderName="Location"
          options={locationOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
        <Input
          className="h-9 w-[220px]"
          placeholder="Search student"
          value={searchValue}
          onChange={(event) => {
            const value = event.target.value;
            setColumnFilters((previous) => {
              const others = previous.filter(
                (filter) => filter.id !== "student_name",
              );
              return value
                ? [...others, { id: "student_name", value }]
                : others;
            });
          }}
        />
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setColumnFilters([])}
          >
            <X className="size-3.5" /> Clear filters
          </Button>
        )}
      </div>
      <div className="text-sm text-muted-foreground" aria-live="polite">
        {selectedIds.size} selected
      </div>
      <DataTable
        columns={columns}
        data={owings}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        columnVisibility={{
          grade: false,
          subject_name: false,
          location: false,
        }}
      />

      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select SMS Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {OWING_SMS_TEMPLATES.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template} (placeholder)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              SMS template loading and sending are not connected yet.
            </p>
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
              Please double-check the Enrolment fee for the subjects if your
              selected message includes the Fee to ensure the details are
              correct.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Close
            </Button>
            <Button disabled>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
