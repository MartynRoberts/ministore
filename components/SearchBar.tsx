type Props = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

export default function SearchBar({ value, onChange, onKeyDown }: Props) {
  return (
    <input
      type="text"
      value={value}
      placeholder="Search products..."
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className="w-full p-2 border"
    />
  );
}