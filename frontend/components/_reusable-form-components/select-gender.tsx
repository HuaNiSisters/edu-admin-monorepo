import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectGenderProps {
  values: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectGender = (props: SelectGenderProps) => {
  const { values, value, onChange } = props;

  const mapValueToLabel: Record<string, string> = {
    M: "Male",
    F: "Female",
  };

  return (
    <Select value={value} onValueChange={onChange} disabled={props.disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a gender" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Gender</SelectLabel>
          {values?.map((value) => (
            <SelectItem key={value} value={value}>
              {mapValueToLabel[value] || value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { SelectGender };
