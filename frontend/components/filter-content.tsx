import React from "react";
import {
  SelectContent,
  SelectItem,
  Select,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnFiltersState } from "@tanstack/react-table";

const FilterContent = ({
  filterValue,
  filterName,
  options,
  columnFilters,
  setColumnFilters,
}: {
  filterValue: string;
  filterName: string;
  placeholderName: string;
  options: string[];
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}) => {
  const ALL = "all";

  const getFilter = (id: string) =>
    (columnFilters.find((f) => f.id === id)?.value as string) ?? ALL;

  const setFilter = (id: string, value: string) => {
    setColumnFilters((prev) =>
      value === ALL
        ? prev.filter((f) => f.id !== id)
        : [...prev.filter((f) => f.id !== id), { id, value }],
    );
  };

  return (
    <Select
      value={getFilter(filterValue)}
      onValueChange={(v) => setFilter(filterValue, v)}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder={filterName} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {filterName}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FilterContent;
