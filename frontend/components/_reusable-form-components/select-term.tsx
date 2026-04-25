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
import { Term } from "@/lib/api/types";

interface SelectTermProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectTerm = (props: SelectTermProps) => {
  const { value, onChange, disabled } = props;

  const [allTerms, setAllTerms] = useState<Term[]>([]);

  const { run } = useAsync();

  // VALIDATE NO OVERLAPPING TERMS?

  const fetchTerms = useCallback(() => {
    run(async () => {
      const data = await termService.getTermsAsync();
      setAllTerms(data);
      console.log("Fetched terms:", data);
      console.log("Term start date:", new Date(data[0].start_date));
      console.log("Term end date:", new Date(data[0].end_date));
      // setTermStartDate(new Date(data[0].start_date));
      // setTermEndDate(new Date(data[0].end_date));
      // const selected = data.find((term) => term.term_id === value);
      // setSelectedTerm(selected);
      // if (selected) {
      //   alert("Selected term has start date: " + selected.start_date);
      //   setTermStartDate(new Date(selected.start_date));
      //   setTermEndDate(new Date(selected.end_date));
      // }
    });
  }, [run]);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  // TODO: Default set term to current term
  // using onChange
  const [selectedTerm, setSelectedTerm] = useState<
    Term & { labelText: string }
  >();

  // TODO: DISPLAY IF TERMS ARE INT HE FUTURE OR

  const [canEditDates, setCanEditDates] = useState(false);
  const [termStartDate, setTermStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [termEndDate, setTermEndDate] = useState<Date | undefined>(undefined);

  return (
    <div className="flex">
      
      <br/>
      <CreatableSelect
        options={allTerms.map((term) => ({
          ...term,
          labelText: `${term.year} Term ${term.name}`,
        }))}
        value={selectedTerm}
        labelKey="labelText"
        valueKey="term_id"
        onValueChange={(value) => {
          setSelectedTerm(value);
          onChange?.(value?.term_id);
          setTermStartDate(new Date(value.start_date));
          setTermEndDate(new Date(value.end_date));
        }}
        onCreateOption={(label) => {
          const currentYear = new Date().getFullYear();
          // ACTUALLY SET THE START AND END AND MIN AND MAX BASED ON OTHER TERMS
          const yearStart = new Date().toISOString();
          const yearEnd = new Date(currentYear, 11, 31).toISOString();
          const newTerm = {
            term_id: "", // no ID yet — it's unsaved
            name: parseInt(label),
            year: currentYear,
            start_date: yearStart,
            end_date: yearEnd,
            labelText: label, // what the combobox will display
          } satisfies Term & { labelText: string };

          setSelectedTerm(newTerm);
          setCanEditDates(true);
          return newTerm;
        }}
        placeholder="Select a Term…"
      />
      <DateRangePicker
        isDisabled={!canEditDates}
        startDate={termStartDate}
        endDate={termEndDate}
        minDate={new Date(new Date().getFullYear(), 0, 1)}
        maxDate={new Date(new Date().getFullYear(), 11, 31)}
      />
    </div>
  );
};

export { SelectTerm };
