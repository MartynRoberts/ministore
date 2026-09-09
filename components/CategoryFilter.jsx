import { Select } from "@/components/ui/FormControls";

export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <Select aria-label="Category" value={value} onChange={(e) => onChange(e.target.value)} className="w-auto">
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </Select>
  );
}
