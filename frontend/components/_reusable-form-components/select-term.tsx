import { useEffect, useState } from "react";

import { termService } from "@/lib/services";
import { useAsync } from "@/hooks/use-async";

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
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns/addDays";

const MIN_YEAR = parseInt(process.env.MIN_YEAR || "2024");
const MAX_YEAR = parseInt(
  process.env.MAX_YEAR || `${new Date().getFullYear() + 1}`,
);
const N_TERMS = parseInt(process.env.N_TERMS || "5");

enum TermStatus {
  NEW = "New",
  CURRENT = "Current",
  PAST = "Past",
}

interface SelectTermProps {
  value?: string;
  onChange?: (termData: Partial<Term>) => void;
  disabled?: boolean;
}

const SelectTerm = (props: SelectTermProps) => {
  const { value, onChange, disabled } = props;

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
  const getTermWithLargestDate = () => {
    const sortedTerms = [...allTerms].sort(
      (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime(),
    );
    return sortedTerms[0];
  };

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
        onChange?.({
          term_id: foundTerm.term_id,
          year: selectedYear,
          name: selectedTermNumber,
          start_date: selectedTermStartDate?.toISOString(),
          end_date: selectedTermEndDate?.toISOString(),
        });
        return;
      }

      if (getTermStatus() === TermStatus.PAST) return;

      const lastTerm = getTermWithLargestDate();
      const lastTermEndDate = lastTerm
        ? new Date(lastTerm.end_date)
        : new Date();
      const defaultStartDate = new Date(selectedYear, 0, 1);
      const defaultEndDate = new Date(selectedYear, 11, 31);
      selectSelectedTermStartDate(
        lastTermEndDate > defaultStartDate
          ? addDays(lastTermEndDate, 1)
          : defaultStartDate,
      );
      setSelectedTermEndDate(defaultEndDate);
      onChange?.({
        year: selectedYear,
        name: selectedTermNumber,
        start_date: selectedTermStartDate?.toISOString(),
        end_date: selectedTermEndDate?.toISOString(),
      });
    }
  }, [selectedTermNumber, selectedYear]);

  const disableEditTermDates = () => {
    // only allow selecting current term for now
    return true;
    // Can the currently logged in user edit the term dates? Only if they are creating a new term (i.e. there isn't already a term with the same year and number)
    return getTermStatus() === TermStatus.PAST;
  };

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
        <div className="">
          <DateRangePicker
            className="justify-start"
            isDisabled={disableEditTermDates()}
            startDate={selectedTermStartDate}
            endDate={selectedTermEndDate}
            onChange={(dateRange: DateRange | undefined) => {
              if (!dateRange) return;
              selectSelectedTermStartDate(dateRange.from);
              setSelectedTermEndDate(dateRange.to);
              onChange?.({
                term_id: findExistingTerm(selectedYear!, selectedTermNumber!)
                  ?.term_id,
                year: selectedYear,
                name: selectedTermNumber,
                start_date: dateRange.from?.toISOString(),
                end_date: dateRange.to?.toISOString(),
              });
            }}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      </div>
    </div>
  );
};

export { SelectTerm };
