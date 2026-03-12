"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 my-16">
      <p>Error: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}