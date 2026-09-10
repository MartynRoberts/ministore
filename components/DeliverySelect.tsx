import { Select } from "@/components/ui/FormControls";
import { ChevronIcon } from "@/components/ui/ChevronIcon";

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
        className="h-12 w-full"
      >
        <option value="">Select delivery option</option>
        {visibleOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Select>

      <ChevronIcon direction="down" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
    </div>
  );
}
