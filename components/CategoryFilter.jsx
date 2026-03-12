export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="p-2">
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
