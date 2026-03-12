import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { formatGBP } from "@/utils/money";
import ProductActions from "./ProductActions";
import ProductScroller from "@/components/ProductScroller";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const id = Number(slug);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = await api.getProduct(id).catch(() => null);
  if (!product) notFound();

  const title = product.category.charAt(0).toUpperCase() + product.category.slice(1);

  const allProducts = await api.getProducts();

  const recommendations = allProducts
    .filter((p: any) => p.id !== product.id)
    .sort((a: any, b: any) => {
      const aSameCategory = a.category === product.category ? 1 : 0;
      const bSameCategory = b.category === product.category ? 1 : 0;
      return bSameCategory - aSameCategory;
    })
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 my-16">
      <Link href="/Home">Home</Link><span className="mx-1">/</span><span>{product.title}</span>

      <div className="mt-16 flex flex-col gap-10 lg:flex-row justify-between">
        <div className="w-full aspect-square max-w-full lg:max-w-[800px]">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>

        <div className="lg:max-w-[700px]">
          <h1 className="text-xl font-bold mb-3">{product.title}</h1>
          <p className="text-lg font-bold mb-8">{formatGBP(product.price)}</p>

          <ProductActions
            productId={product.id}
            category={product.category}
          />

          <p className="max-w-[700px] mb-3">{product.description}</p>

          <p className="mb-3">
            Category:{" "}
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-gray-600 underline hover:text-black"
            >
              {title}
            </Link>
          </p>
        </div>
      </div>

      <ProductScroller
        title="You may also like"
        products={recommendations}
        viewAllHref="/products"
      />
    </div>
  );
}
