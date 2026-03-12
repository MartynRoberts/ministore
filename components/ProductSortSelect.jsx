export default function ProductSortSelect({ sortOptions, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="p-2">
      {sortOptions.map(({id,name}) => (
        <option key={id} value={id}>{name}</option>
      ))}
    </select>
  );
}
