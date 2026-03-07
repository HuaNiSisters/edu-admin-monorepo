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
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectGender = (props: SelectGenderProps) => {
  const { options, value, onChange } = props;

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
          {options?.map((option) => (
            <SelectItem key={option} value={option}>
              {mapValueToLabel[option] || option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { SelectGender };
