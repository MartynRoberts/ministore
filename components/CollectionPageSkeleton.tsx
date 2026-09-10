import Skeleton from "@/components/Skeleton";
import { Card, PageContainer } from "@/components/ui/Layout";

export default function CollectionPageSkeleton({ label }: { label: string }) {
  return (
    <PageContainer>
      <div aria-label={label} aria-busy="true">
        <Skeleton className="h-7 w-36" />
        <Card className="mt-8 px-5 py-10 sm:py-14">
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto mt-5 h-8 w-64 max-w-full" />
          <Skeleton className="mx-auto mt-3 h-5 w-96 max-w-full" />
          <Skeleton className="mx-auto mt-6 h-12 w-40" />
        </Card>
        <Skeleton className="mt-12 h-8 w-56" />
        <Skeleton className="mt-3 h-5 w-72 max-w-full" />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="p-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="mt-3 h-5 w-4/5" />
              <Skeleton className="mt-2 h-5 w-1/2" />
              <Skeleton className="mt-4 h-11 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
