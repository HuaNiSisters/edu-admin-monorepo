import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";

const MAX_VISIBLE_BADGES = 2;

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
  const getSelected = (id: string): string[] =>
    (columnFilters.find((f) => f.id === id)?.value as string[]) ?? [];

  const toggleValue = (id: string, value: string) => {
    setColumnFilters((prev) => {
      const current = (prev.find((f) => f.id === id)?.value as string[]) ?? [];
      const others = prev.filter((f) => f.id !== id);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return next.length === 0 ? others : [...others, { id, value: next }];
    });
  };

  const clear = (id: string) => {
    setColumnFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const selected = getSelected(filterValue);
  const visible = selected.slice(0, MAX_VISIBLE_BADGES);
  const overflow = selected.length - visible.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-auto gap-1.5 border-dashed py-1.5"
        >
          {selected.length === 0 ? (
            filterName
          ) : (
            <>
              <span className="text-muted-foreground">{filterName}:</span>
              <div className="flex flex-wrap items-center gap-1">
                {visible.map((value) => (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {formatValuesRemoveUnderscores(value)}
                  </Badge>
                ))}
                {overflow > 0 && (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    +{overflow}
                  </Badge>
                )}
              </div>
            </>
          )}
          <ChevronDown className="size-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          {filterName}
          {selected.length > 0 && (
            <button
              className="text-xs font-normal text-muted-foreground hover:underline"
              onClick={() => clear(filterValue)}
            >
              Clear
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selected.includes(option)}
            onCheckedChange={() => toggleValue(filterValue, option)}
            onSelect={(e) => e.preventDefault()}
          >
            {formatValuesRemoveUnderscores(option)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterContent;
