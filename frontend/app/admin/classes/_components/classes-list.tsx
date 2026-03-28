"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ColumnFiltersState } from "@tanstack/react-table";
import { ClassTimeWithSubject } from "@/types/IApiWrapper";
import { createClassColumns } from "./classes-columns";
import FilterContent from "@/components/filter-content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const DataTable = dynamic(
  () => import("@/components/ui/data-table").then((m) => m.DataTable),
  { ssr: false },
);

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface ClassesListProps {
  classes: ClassTimeWithSubject[];
  onEdit: (classTime: ClassTimeWithSubject) => void;
}

const ClassesList = ({ classes, onEdit }: ClassesListProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(() => createClassColumns(onEdit), [onEdit]);

  // ✅ Filter options (unchanged)
  const subjectOptions = useMemo(
    () =>
      [
        ...new Set(classes.map((c) => c.subject_name).filter(Boolean)),
      ].sort() as string[],
    [classes],
  );

  const gradeOptions = useMemo(
    () =>
      [
        ...new Set(
          classes.map((c) => String(c.grade)).filter((g) => g !== "null"),
        ),
      ].sort((a, b) => Number(a) - Number(b)),
    [classes],
  );

  const dayOptions = DAY_ORDER.filter((d) =>
    classes.some((c) => c.day_of_week === d),
  );

  const locationOptions = useMemo(
    () =>
      [
        ...new Set(classes.map((c) => c.location).filter(Boolean)),
      ].sort() as string[],
    [classes],
  );

  const hasActiveFilters = columnFilters.length > 0;

  return (
    <div className="space-y-3">
      {/* ✅ Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
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

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Start Time</span>

          <Input
            type="time"
            step="60"
            className="w-[160px]"
            value={
              (columnFilters.find((f) => f.id === "start_time")
                ?.value as string) ?? ""
            }
            onChange={(e) => {
              const value = e.target.value;

              setColumnFilters((prev) => {
                const otherFilters = prev.filter((f) => f.id !== "start_time");

                if (!value) return otherFilters;

                return [
                  ...otherFilters,
                  {
                    id: "start_time",
                    value,
                  },
                ];
              });
            }}
          />
        </div>

        <FilterContent
          filterValue="location"
          filterName="Locations"
          placeholderName="Location"
          options={locationOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <FilterContent
          filterValue="active"
          filterName="Status"
          placeholderName="Status"
          options={["Active", "Inactive"]}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setColumnFilters([])}
          >
            <X className="size-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={classes}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
    </div>
  );
};

export default ClassesList;
