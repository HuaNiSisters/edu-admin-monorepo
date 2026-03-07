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
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectStatus = (props: SelectStatusProps) => {
  const { options, value, onChange, disabled } = props;

  const mapValueToLabel: Record<string, string> = {
    attending: "Attending",
    alumni: "Alumni",
  };

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
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

export { SelectStatus };
