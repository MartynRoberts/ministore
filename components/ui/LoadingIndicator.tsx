export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} animate-spin motion-reduce:animate-none`}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

export function LoadingIndicator({ active, label }: { active: boolean; label: string }) {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center" aria-live="polite" aria-atomic="true">
      {active && (
        <>
          <Spinner className="h-5 w-5 text-text-muted" />
          <span className="sr-only">{label}</span>
        </>
      )}
    </span>
  );
}

export function PageLoading({ label }: { label: string }) {
  return (
    <div role="status" className="flex min-h-48 flex-col items-center justify-center gap-3 text-text-muted">
      <Spinner className="h-7 w-7" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
