import Link from "next/link";
import { api } from "@/lib/api";
import ProductScroller from "@/components/ProductScroller";


export default async function HomePage() {
  const products = await api.getProducts();

  const categories = Array.from(
    new Set(products.map((p) => p.category))
  ).sort();

  const topSellers = products.slice(0, 6);

  return (
    <div className="pb-16">
      <div className="relative mb-8">
        <img
          src="https://images.unsplash.com/photo-1664455340023-214c33a9d0bd?q=80&w=1032&auto=format&fit=crop"
          alt="Shopping image"
          className="block w-full"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <h2 className="text-3xl font-bold">Spring Deals</h2>
          <p className="mt-2 text-lg">
            Discover new arrivals and trending products.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center rounded-md bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Shop now
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1680px] px-4">
        <p className="mb-6">Discover great products across our categories.</p>

        <div className="mb-10">
          <Link
            href="/products"
            className="inline-flex items-center rounded-md bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Browse all products
          </Link>
        </div>

        <h2 className="mb-4 text-2xl font-bold">Shop by category</h2>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const title = category.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
            const image = products.find((product) => product.category === category)!.image;

            return (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="block overflow-hidden rounded-lg border border-gray-300 text-inherit no-underline transition hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={image}
                  alt={title}
                  className="h-48 w-full object-contain"
                />

                <div className="p-4">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="opacity-80">View products</p>
                </div>
              </Link>
            );
          })}
        </div>

        <ProductScroller
          title="Top sellers"
          products={topSellers}
          viewAllHref="/products"
        />
      </div>
    </div>
  );
}
