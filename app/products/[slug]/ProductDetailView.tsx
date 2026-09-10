import Skeleton from "@/components/Skeleton";
import type { Product } from "@/types";
import { PageContainer } from "@/components/ui/Layout";
import ProductInformation from "./ProductInformation";

type Props = { product?: Product; recommendations?: Product[]; loading?: boolean };

export default function ProductDetailView({ product, recommendations = [], loading = false }: Props) {
  if (!loading && product) return <ProductInformation product={product} recommendations={recommendations} />;

  return <PageContainer>
    <Skeleton className="mb-8 h-4 w-[220px] max-w-full" />
    <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-12">
      <Skeleton className="aspect-square w-full lg:col-span-3" />
      <div className="lg:col-span-2">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="mb-4 h-9 w-full" />
        <Skeleton className="mb-6 h-5 w-52" />
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-3 h-5 w-full" />
        <Skeleton className="mb-8 h-5 w-4/5" />
        <Skeleton className="mb-4 h-14 w-full" />
      </div>
    </div>
    <section className="mt-16">
      <Skeleton className="mb-4 h-8 w-[220px]" />
      <div className="flex gap-4 overflow-hidden">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="w-[220px] shrink-0 overflow-hidden rounded-lg border border-border bg-surface"><Skeleton className="aspect-square w-full" /><div className="p-4"><Skeleton className="mb-2 h-5 w-full" /><Skeleton className="mb-2 h-5 w-3/4" /><Skeleton className="mt-4 h-5 w-20" /></div></div>)}</div>
    </section>
  </PageContainer>;
}
