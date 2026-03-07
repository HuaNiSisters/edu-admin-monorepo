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
}

const SelectLocation = (props: SelectLocationProps) => {
  const { values, value, onChange } = props;

  const formatLabel = (value: string) =>
    value
      .split("_")
      .map((word) =>
        word === "and" ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ");

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a location" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Locations</SelectLabel>
          {values?.map((value) => (
            <SelectItem key={value} value={value}>
              {formatLabel(value)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export { SelectLocation };
