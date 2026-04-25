"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRangePickerProps {
  /** Controlled selected range */
  value?: DateRange;
  /** Default range for uncontrolled usage */
  defaultValue?: DateRange;
  /** Called when the selected range changes */
  onChange?: (range: DateRange | undefined) => void;
  /** Disables the picker */
  isDisabled?: boolean;
  /** Placeholder shown when no date is selected */
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Number of calendar months to display */
  numberOfMonths?: number;
  /** Date format string (date-fns pattern) */
  dateFormat?: string;
  /** Label shown above the picker */
  label?: string;
  /** Additional className for the Field wrapper */
  className?: string;

  startDate?: Date;
  endDate?: Date;
}

const DEFAULT_RANGE: DateRange = {
  from: new Date(new Date().getFullYear(), 0, 20),
  to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
};

export function DateRangePicker(props: DateRangePickerProps) {
  const {
    value,
    defaultValue = DEFAULT_RANGE,
    onChange,
    isDisabled,
    placeholder = "Pick a date",
    minDate,
    maxDate,
    startDate,
    endDate,
    numberOfMonths = 2,
    dateFormat = "LLL dd, y",
    label,
    className,
  } = props;

  const [internalDate, setInternalDate] = useState<DateRange | undefined>(
    defaultValue,
  );

  useEffect(() => {
    setInternalDate({
      from: startDate,
      to: endDate,
    });
  }, [startDate, endDate]);

  const isControlled = value !== undefined;
  const date = isControlled ? value : internalDate;

  const handleSelect = (range: DateRange | undefined) => {
    if (!isControlled) setInternalDate(range);
    onChange?.(range);
  };

  return (
    <Field className={`mx-auto w-60 ${className ?? ""}`}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Popover>
        <PopoverTrigger asChild className="w-full">
          <Button
            variant="outline"
            id="date-picker-range"
            className="justify-start px-2.5 font-normal"
            disabled={isDisabled}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, dateFormat)} -{" "}
                  {format(date.to, dateFormat)}
                </>
              ) : (
                format(date.from, dateFormat)
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            disabled={isDisabled}
            fromDate={minDate}
            toDate={maxDate}
            showOutsideDays={false}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
