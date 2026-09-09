"use client";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/ui/Layout";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageContainer>
      <h3>Unable to load basket</h3>
      <p>Error: {error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </PageContainer>
  );
}
