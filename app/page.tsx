import Link from "next/link";
import { api } from "@/lib/api";
import ProductScroller from "@/components/ProductScroller";
import { buttonStyles } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import CategoryScroller from "@/components/CategoryScroller";
import CategoryContentSpots from "@/components/CategoryContentSpots";

export default async function HomePage() {
  const products = await api.getProducts();

  const categories = Array.from(new Set(products.map((product) => product.category))).sort();
  const preferredCategories = ["beauty", "fragrances", "furniture", "groceries", "kitchen-accessories", "laptops", "smartphones", "womens-dresses"];
  const popularSlugs = [...preferredCategories.filter(category => categories.includes(category)), ...categories.filter(category => !preferredCategories.includes(category))].slice(0, 8);
  const popularCategories = popularSlugs.map(slug => {
    const categoryProduct = products.find(product => product.category === slug)!;
    return {
      slug,
      title: slug.replaceAll("-", " ").replace(/\b\w/g, letter => letter.toUpperCase()),
      image: categoryProduct.images?.[0] ?? categoryProduct.image,
    };
  });

  const topSellers = products.slice(0, 10);

  return (
    <div className="pb-16">
      <section
        aria-label="Mini Store"
        className="relative mb-8 min-h-[clamp(28rem,65vh,50rem)] bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/home-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-overlay" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-on-primary">
          <h1>
            <span className="sr-only">Mini Store</span>
            <BrandLogo size="hero" />
          </h1>
          <p className="mt-2 text-lg">
            &quot;Like a real store, but not!&quot;
          </p>
          <Link
            href="/products"
            className={buttonStyles({ size: "lg", className: "mt-4" })}
          >
            Browse all products
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full max-w-content px-4">
        <CategoryScroller categories={popularCategories} />
        <CategoryContentSpots />

        <ProductScroller
          title="Top sellers"
          products={topSellers}
          viewAllHref="/products"
        />
      </div>
    </div>
  );
}
