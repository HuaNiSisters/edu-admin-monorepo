import { useCallback, useEffect, useState } from "react";

import { classService, termService } from "@/lib/services";
import { useAsync } from "@/hooks/use-async";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../ui/combobox";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { CreatableSelect } from "../ui/createable-select";
import { DateRangePicker } from "../ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Term } from "@/lib/api/types";
import { Badge } from "../ui/badge";
import { dateIsInThePast } from "@/utils/date-utils";

const MIN_YEAR = parseInt(process.env.MIN_YEAR || "2024");
const MAX_YEAR = parseInt(
  process.env.MAX_YEAR || `${new Date().getFullYear() + 1}`,
);
const N_TERMS = parseInt(process.env.N_TERMS || "4");

enum TermStatus {
  NEW = "New",
  CURRENT = "Current",
  PAST = "Historical",
}

interface SelectTermProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectTerm = (props: SelectTermProps) => {
  const { value, onChange, disabled } = props;

  // Can the currently logged in user edit the term dates? Only if they are creating a new term (i.e. there isn't already a term with the same year and number)

  const minYear = MIN_YEAR;
  const maxYear = MAX_YEAR;
  const selectableYears = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i,
  );
  const selectableTermNumbers = Array.from(
    { length: N_TERMS },
    (_, i) => i + 1,
  );

  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined,
  );
  const [selectedTermNumber, setSelectedTermNumber] = useState<
    number | undefined
  >(undefined);
  const [minDate, setMinDate] = useState<Date | undefined>(undefined);
  const [maxDate, setMaxDate] = useState<Date | undefined>(undefined);

  const [selectedTermStartDate, selectSelectedTermStartDate] = useState<
    Date | undefined
  >(undefined);
  const [selectedTermEndDate, setSelectedTermEndDate] = useState<
    Date | undefined
  >(undefined);

  const [allTerms, setAllTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<
    Term & { labelText: string }
  >();

  const { run } = useAsync();

  // VALIDATE NO OVERLAPPING TERMS?
  const findExistingTerm = (year: number, termNumber: number) => {
    return allTerms.find(
      (term) => term.year === year && term.name === termNumber,
    );
  };

  const termIsCurrent = (term?: Term) => {
    if (!term) return false;
    const now = new Date();
    const start = new Date(term.start_date);
    const end = new Date(term.end_date);
    return start <= now && now <= end;
  };

  const getTermStatus = (): TermStatus | undefined => {
    if (dateIsInThePast(new Date(selectedYear!, 11, 31)))
      return TermStatus.PAST;
    const term = findExistingTerm(selectedYear!, selectedTermNumber!);
    if (!term) return TermStatus.NEW;
    if (termIsCurrent(term)) return TermStatus.CURRENT;

    const now = new Date();
    const start = new Date(term.start_date);
    const end = new Date(term.end_date);

    if (start <= now && now <= end) return TermStatus.CURRENT;
    if (end < now) return TermStatus.PAST;
  };

  useEffect(() => {
    setSelectedYear(new Date().getFullYear());
    run(async () => {
      const data = await termService.getTermsAsync();
      setAllTerms(data);

      // Determine which is the current term and set it as the default
      const currentTerm = data.find(termIsCurrent);
      setSelectedYear(
        currentTerm ? currentTerm.year : new Date().getFullYear(),
      );
      setSelectedTermNumber(currentTerm ? currentTerm.name : undefined);
      selectSelectedTermStartDate(
        currentTerm ? new Date(currentTerm.start_date) : new Date(),
      );
      setSelectedTermEndDate(
        currentTerm
          ? new Date(currentTerm.end_date)
          : new Date(new Date().getFullYear(), 11, 31),
      );
    });
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    // Set the min and max date on the date picker
    const firstOfSelectedyear = new Date(selectedYear!, 0, 1);
    const endOfSelectedYear = new Date(selectedYear!, 11, 31);
    setMinDate(firstOfSelectedyear);
    setMaxDate(endOfSelectedYear);

    selectSelectedTermStartDate(firstOfSelectedyear);
    setSelectedTermEndDate(endOfSelectedYear);
  }, [selectedYear]);

  useEffect(() => {
    // When the term changes, and there is a year, set the selectable dates
    if (!!selectedTermNumber && !!selectedYear) {
      // See if there is already a term with the year and number
      const foundTerm = findExistingTerm(selectedYear, selectedTermNumber);
      if (foundTerm) {
        selectSelectedTermStartDate(new Date(foundTerm.start_date));
        setSelectedTermEndDate(new Date(foundTerm.end_date));
      }
    }
  }, [selectedTermNumber, selectedYear]);

  return (
    <div>
      <div className="flex gap-2 items-center">
        <span className="shrink-0">Year:</span>
        <Select
          value={`${selectedYear}`}
          onValueChange={(yearStr) => setSelectedYear(parseInt(yearStr))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a year" />
          </SelectTrigger>
          <SelectContent>
            {selectableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year.toString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="shrink-0">Term:</span>
        <Select
          value={`${selectedTermNumber}`}
          onValueChange={(value) => setSelectedTermNumber(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a term number" />
          </SelectTrigger>
          <SelectContent>
            {selectableTermNumbers.map((termNumber) => (
              <SelectItem key={termNumber} value={termNumber.toString()}>
                {termNumber.toString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!getTermStatus() ? null : (
          <Badge variant="outline" className="text-xs py-0">
            {getTermStatus()}
          </Badge>
        )}
      </div>

      <div className="w-2/3">
        <DateRangePicker
          className="justify-start"
          isDisabled={getTermStatus() === TermStatus.PAST}
          startDate={selectedTermStartDate}
          endDate={selectedTermEndDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
    </div>
  );
};

export { SelectTerm };
