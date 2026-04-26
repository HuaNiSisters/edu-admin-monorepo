import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassTimeWithSubjectAndTutor } from "@/lib/api/types";
import { classService } from "@/lib/services";
import { useAsync } from "@/hooks/use-async";

interface SelectClassProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectClass = (props: SelectClassProps) => {
  const { value, onChange, disabled } = props;

  const [allClasses, setAllClasses] = useState<ClassTimeWithSubjectAndTutor[]>(
    [],
  );

  const { run } = useAsync();

  const fetchClasses = useCallback(() => {
    run(async () => {
      const data = await classService.getClassTimesAsync();
      setAllClasses(data);
    });
  }, [run]);

  useEffect(() => {
    fetchClasses();
    // get all terms?
  }, []);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a class" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Classes</SelectLabel>
          {allClasses.map((c) => (
            <SelectItem key={c.class_id} value={c.class_id}>
              {c.subject_name} - {c.day_of_week} {c.start_time} to {c.end_time}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { SelectClass };
