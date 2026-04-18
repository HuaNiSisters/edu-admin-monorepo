import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatValuesRemoveUnderscores } from "@/utils/text-utils";
interface SelectLocationProps {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectLocation = (props: SelectLocationProps) => {
  const { options, value, onChange, disabled } = props;

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
              {formatValuesRemoveUnderscores(option)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { SelectLocation };
