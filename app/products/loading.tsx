import Skeleton from "@/components/Skeleton";
import { Card, PageContainer } from "@/components/ui/Layout";

export default function Loading() {
  return (
    <PageContainer>
      <div className="mb-6" role="status" aria-label="Loading products" aria-busy="true">
        <span className="sr-only">Loading products</span>
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="mt-3 h-5 w-80 max-w-full" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Skeleton className="h-11 w-44" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="ml-auto h-11 w-44" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 24 }, (_, index) => (
          <Card key={index} className="flex h-full flex-col p-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="mt-3 h-5 w-4/5" />
            <Skeleton className="mt-2 h-5 w-1/2" />
            <Skeleton className="mt-4 h-11 w-full" />
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
