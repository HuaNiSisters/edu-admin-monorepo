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

  const mapValueToLabel: Record<string, string> = {
    cabramatta_and_canley_vale: "Cabramatta and Canley Vale",
    parramatta: "Parramatta",
    online: "Online",
  };

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
              {mapValueToLabel[option] || option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { SelectLocation };
