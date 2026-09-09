import { Select } from "@/components/ui/FormControls";

export default function ProductSortSelect({ sortOptions, value, onChange }) {
  return (
    <Select aria-label="Sort products" value={value} onChange={(e) => onChange(e.target.value)} className="w-auto">
      {sortOptions.map(({id,name}) => (
        <option key={id} value={id}>{name}</option>
      ))}
    </Select>
  );
}
