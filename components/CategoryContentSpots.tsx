import Link from "next/link";
import Image from "next/image";

const spots = [
  {
    category: "womens-dresses",
    title: "Women’s dresses",
    image: "/categories-dresses.jpg",
    size: "short",
  },
  {
    category: "kitchen-accessories",
    title: "Kitchen accessories",
    image: "/categories-kitchen-accessories.jpg",
    size: "tall",
  },
  {
    category: "mens-watches",
    title: "Men’s watches",
    image: "/categories-watches.jpg",
    size: "tall",
  },
  {
    category: "mens-shirts",
    title: "Men’s shirts",
    image: "/categories-shirts.jpg",
    size: "short",
  },
] as const;

function ContentSpot({ spot }: { spot: (typeof spots)[number] }) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(spot.category)}`}
      className={`group relative flex overflow-hidden rounded-lg text-on-primary no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus ${spot.size === "tall" ? "min-h-[32rem]" : "min-h-80"}`}
    >
      <Image src={spot.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
      <span className="absolute inset-0 bg-overlay transition group-hover:opacity-90" />
      <span className="relative m-auto flex flex-col items-center px-6 py-10 text-center">
        <span className="text-3xl sm:text-4xl">{spot.title}</span>
        <span className="mt-4 rounded-md border border-primary bg-primary px-6 py-3 text-lg font-semibold text-on-primary transition group-hover:bg-primary-hover">
          Shop now
        </span>
      </span>
    </Link>
  );
}

export default function CategoryContentSpots() {
  return (
    <section className="mt-16" aria-labelledby="featured-categories-heading">
      <h2 id="featured-categories-heading" className="sr-only">
        Featured categories
      </h2>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="grid gap-6 lg:gap-8">
          <ContentSpot spot={spots[0]} />
          <ContentSpot spot={spots[1]} />
        </div>
        <div className="grid gap-6 lg:gap-8">
          <ContentSpot spot={spots[2]} />
          <ContentSpot spot={spots[3]} />
        </div>
      </div>
    </section>
  );
}
