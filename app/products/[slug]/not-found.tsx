import Link from "next/link";
import { PageContainer } from "@/components/ui/Layout";
import { ChevronIcon } from "@/components/ui/ChevronIcon";

export default function NotFound() {
  return (
    <PageContainer>
      <h2>Product not found</h2>
      <Link className="mt-3 inline-flex items-center gap-2" href="/products">
        <ChevronIcon className="h-4 w-4" />
        Back to products
      </Link>
    </PageContainer>
  );
}
