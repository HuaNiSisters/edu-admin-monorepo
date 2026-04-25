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

  const fetchTerms = useCallback(() => {
    run(async () => {
      const data = await termService.getTermsAsync();
      setAllTerms(data);
    });
  }, [run]);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const [date, setDate] = useState<Date | undefined>(new Date());

  // TODO: Default set term to current term
  // using onChange
  const [selected, setSelected] = useState<any>();

  // TODO: DISPLAY IF TERMS ARE INT HE FUTURE OR 

  return (
    <div className="flex">
      <CreatableSelect
        options={allTerms.map((term) => ({
          id: term.term_id,
          name: `${term.year} Term ${term.name}`,
        }))}
        value={selected}
        labelKey="name"
        valueKey="id"
        onValueChange={(value) => {
          setSelected(value);
          onChange?.(value?.id);
        }}
        onCreateOption={(label) => {
          
        }}
        placeholder="Select a Term…"
      />
      <DateRangePicker />
    </div>
  );
};

export { SelectTerm };
