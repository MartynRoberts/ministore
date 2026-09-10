export function HeartIcon({ filled = false, className = "h-6 w-6" }: { filled?: boolean; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.72-4.52-9.43-7.23A5.25 5.25 0 0 1 12 4.5a5.25 5.25 0 0 1 9.43 9.27C18.72 16.48 12 21 12 21Z" />
  </svg>;
}
