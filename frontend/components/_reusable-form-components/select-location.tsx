import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectLocationProps {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectLocation = (props: SelectLocationProps) => {
  const { options, value, onChange, disabled } = props;

  const formatLabel = (value: string) =>
    value
      .split("_")
      .map((word) =>
        word === "and" ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ");

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a location" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Locations</SelectLabel>
          {options?.map((option) => (
            <SelectItem key={option} value={option}>
              {formatLabel(option)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { SelectLocation };
