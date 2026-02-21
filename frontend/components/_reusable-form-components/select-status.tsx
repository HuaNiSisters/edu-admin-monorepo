import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectStatusProps {
  values: string[];
  value?: string;
  onChange?: (value: string) => void;
}

const SelectStatus = (props: SelectStatusProps) => {
  const { values, value, onChange } = props;

  const mapValueToLabel: Record<string, string> = {
    attending: "Attending",
    alumni: "Alumni",
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
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

export { SelectStatus };
