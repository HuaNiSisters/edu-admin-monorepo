"use client";

import { useMemo, useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { ClassTimeWithSubjectAndTutor } from "@/lib/api/types";
import { createClassColumns } from "./classes-columns";
import FilterContent from "@/components/filter-content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";

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
  classes: ClassTimeWithSubjectAndTutor[];
  onEdit?: (classTime: ClassTimeWithSubjectAndTutor) => void; // make optional
}

const ClassesList = ({ classes, onEdit }: ClassesListProps) => {
  const router = useRouter();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () => createClassColumns(onEdit), // pass undefined when not provided
    [onEdit],
  );

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
        ...new Set(
          classes
            .map((c) => formatValuesRemoveUnderscores(c.location ?? ""))
            .filter(Boolean),
        ),
      ].sort() as string[],
    [classes],
  );

  // Derive which status labels actually exist in the data, preserving both true/false
  const statusOptions = useMemo(() => {
    const hasActive = classes.some((c) => c.active === true);
    const hasInactive = classes.some((c) => c.active === false);
    const options: string[] = [];
    if (hasActive) options.push("Active");
    if (hasInactive) options.push("Inactive");
    return options;
  }, [classes]);

  const tutorOptions = useMemo(() => {
    return [
      ...new Set(classes.map((c) => c.tutor).filter(Boolean)),
    ].sort() as string[];
  }, [classes]);

  const hasActiveFilters = columnFilters.length > 0;

  const onClickRow = (classId: string) => {
    router.replace(`/student/attendance/${classId}`);
  };

  return (
    <div className="space-y-3">
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
                return [...otherFilters, { id: "start_time", value }];
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

        {/* Status filter stores "Active" | "Inactive" strings as the filter value */}
        <FilterContent
          filterValue="active"
          filterName="Status"
          placeholderName="Status"
          options={statusOptions}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <FilterContent
          filterValue="tutor"
          filterName="Tutor"
          placeholderName="Tutor"
          options={tutorOptions}
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
        onRowClick={(row: ClassTimeWithSubjectAndTutor) =>
          onClickRow(row.class_id)
        }
      />
    </div>
  );
};

export default ClassesList;
