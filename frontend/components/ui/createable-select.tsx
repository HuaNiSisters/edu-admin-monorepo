"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CreatableSelectProps<T extends Record<string, unknown>> {
  options: T[];
  value?: T;
  onValueChange: (value: T) => void;
  onCreateOption?: (label: string) => T;
  labelKey: keyof T;
  valueKey: keyof T;
  placeholder?: string;
}

export function CreatableSelect<T extends Record<string, unknown>>({
  options,
  value,
  onValueChange,
  onCreateOption,
  labelKey,
  valueKey,
  placeholder = "Select or create…",
}: CreatableSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
//   const [items, setItems] = React.useState<T[]>(options);

  const getLabel = (item: T) => String(item[labelKey]);
  const getValue = (item: T) => String(item[valueKey]);

  const filtered = options.filter((o) =>
    getLabel(o).toLowerCase().includes(query.toLowerCase())
  );
  const exactMatch = options.some(
    (o) => getLabel(o).toLowerCase() === query.toLowerCase()
  );
  const showCreate = query.trim() !== "" && !exactMatch;
  const isNew = value
    ? !options.some((o) => getValue(o) === getValue(value))
    : false;

  function handleCreate() {
    if (!onCreateOption) return;
    const newItem = onCreateOption(query.trim());
    // setItems((prev) => [...prev, newItem]);
    onValueChange(newItem);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between font-normal"
        >
          {value ? (
            <span className="flex items-center gap-2">
              {getLabel(value)}
              {isNew && (
                <Badge variant="secondary" className="text-xs py-0">
                  new
                </Badge>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or create…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandGroup>
              {filtered.map((option) => (
                <CommandItem
                  key={getValue(option)}
                  value={getLabel(option)}
                  onSelect={() => {
                    onValueChange(option);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value && getValue(value) === getValue(option)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {getLabel(option)}
                </CommandItem>
              ))}
            </CommandGroup>

            {showCreate && (
              <>
                {filtered.length > 0 && <CommandSeparator />}
                <CommandGroup>
                  <CommandItem onSelect={handleCreate} className="text-blue-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create &quot;{query}&quot;
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {!filtered.length && !showCreate && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}