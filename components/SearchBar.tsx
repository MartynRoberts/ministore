type Props = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

export default function SearchBar({ value, onChange, onKeyDown }: Props) {
  return (
    <TextInput
      type="text"
      value={value}
      placeholder="Search products..."
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  );
}
import { TextInput } from "@/components/ui/FormControls";
