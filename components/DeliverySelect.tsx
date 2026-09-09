import { Select } from "@/components/ui/FormControls";

type DeliveryOption = {
  id: string;
  name: string;
  price: number;
};

export default function DeliverySelect({
  deliveryOptions,
  value,
  onChange,
  isFreeDelivery,
}: {
  deliveryOptions: DeliveryOption[];
  value: string;
  onChange: (value: string) => void;
  isFreeDelivery: boolean;
}) {
  const visibleOptions = isFreeDelivery
    ? deliveryOptions.filter((option) => option.id !== "standard")
    : deliveryOptions.filter((option) => option.id !== "free-standard");

  return (
    <div className="relative">
      <Select
        id="delivery"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none"
      >
        <option value="">Select delivery option</option>
        {visibleOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Select>

      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.7a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
