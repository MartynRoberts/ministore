import Link from "next/link";
import { api } from "@/lib/api";
import ProductScroller from "@/components/ProductScroller";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Layout";
import { BrandLogo } from "@/components/ui/BrandLogo";


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
          src="/home-hero.jpg"
          alt="Mini Store"
          className="block w-full"
        />

        <div className="absolute inset-0 bg-overlay" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-on-primary">
          <h1>
            <span className="sr-only">Mini Store</span>
            <BrandLogo size="hero" />
          </h1>
          <p className="mt-2 text-lg">
            &quot;Like a real store, but not!&quot;
          </p>
          <Link href="/products" className={buttonStyles({ size: "lg", className: "mt-4" })}>
            Shop now
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-content px-4">
        <p className="mb-6">Discover great products across our categories.</p>

        <div className="mb-10">
          <Link href="/products" className={buttonStyles()}>
            Browse all products
          </Link>
        </div>

        <h2 className="mb-4 text-2xl font-bold">Shop by category</h2>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const title = category.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
            const image = products.find((product) => product.category === category)!.image;

            return (
              <Card key={category} className="overflow-hidden transition hover:-translate-y-1 hover:shadow-card">
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="block text-inherit no-underline"
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
              </Card>
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
