type Direction = "up" | "right" | "down" | "left";

const rotations: Record<Direction, string> = {
  up: "rotate-90",
  right: "rotate-180",
  down: "-rotate-90",
  left: "",
};

export function ChevronIcon({ direction = "left", className = "h-5 w-5" }: { direction?: Direction; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={`shrink-0 ${rotations[direction]} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 5-5 5 5 5" />
    </svg>
  );
}
