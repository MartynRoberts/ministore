import Link from "next/link";
import { PageContainer } from "@/components/ui/Layout";

export default function NotFound() {
  return (
    <PageContainer>
      <h2>Product not found</h2>
      <Link className="mt-3 inline-flex items-center gap-2" href="/products">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
        Back to products
      </Link>
    </PageContainer>
  );
}
