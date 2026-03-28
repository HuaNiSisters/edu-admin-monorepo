"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ColumnFiltersState } from "@tanstack/react-table";
import { SubjectOffering } from "@/types/IApiWrapper";
import { createSubjectColumns } from "./subjects-columns";
import FilterContent from "@/components/filter-content";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const DataTable = dynamic(
  () => import("@/components/ui/data-table").then((m) => m.DataTable),
  { ssr: false },
);

type SubjectsListProps = {
  subjectOfferings: SubjectOffering[];
  onEdit: (subject: SubjectOffering) => void;
};

const SubjectsList = ({ subjectOfferings, onEdit }: SubjectsListProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () => createSubjectColumns(onEdit, subjectOfferings),
    [onEdit, subjectOfferings],
  );

  const locationOptions = useMemo(
    () =>
      [
        ...new Set(subjectOfferings.map((s) => s.location).filter(Boolean)),
      ].sort() as string[],
    [subjectOfferings],
  );

  const subjectOptions = useMemo(
    () => [...new Set(subjectOfferings.map((s) => s.subject_name))].sort(),
    [subjectOfferings],
  );

  const gradeOptions = useMemo(
    () =>
      [...new Set(subjectOfferings.map((s) => String(s.grade)))].sort(
        (a, b) => Number(a) - Number(b),
      ),
    [subjectOfferings],
  );

  const hasActiveFilters = columnFilters.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterContent
          filterValue="subject_name"
          filterName="Subjects"
          placeholderName="Subject"
          options={subjectOptions}
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
          filterValue="location"
          filterName="Locations"
          placeholderName="Location"
          options={locationOptions}
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

      {/* ✅ Table */}
      <DataTable
        columns={columns}
        data={subjectOfferings}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
    </div>
  );
};

export default SubjectsList;
