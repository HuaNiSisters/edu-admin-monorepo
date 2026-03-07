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
  values: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectLocation = (props: SelectLocationProps) => {
  const { values, value, onChange, disabled } = props;

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

export { SelectLocation };
