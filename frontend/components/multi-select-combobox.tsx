"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectComboboxProps {
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectCombobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
}: MultiSelectComboboxProps) {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      value={value}
      onValueChange={(val) => onChange(val as string[])}
      multiple
    >
      <ComboboxChips ref={anchor}>
        {value.map((v) => (
          <ComboboxChip key={v} value={v}>
            {options.find((o) => o.value === v)?.label}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput
          placeholder={value.length === 0 ? placeholder : ""}
        />
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          <ComboboxEmpty>No options found.</ComboboxEmpty>
          {options.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
