"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronIcon } from "@/components/ui/ChevronIcon";
import Image from "next/image";

export type CategoryPreview = { slug: string; title: string; image: string };

export default function CategoryScroller({ categories }: { categories: CategoryPreview[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(categories.length > 1);
  const updateControls = () => {
    const element = scroller.current;
    if (!element) return;
    setCanPrevious(element.scrollLeft > 1);
    setCanNext(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
  };
  useEffect(() => {
    updateControls();
    const observer = new ResizeObserver(updateControls);
    if (scroller.current) observer.observe(scroller.current);
    return () => observer.disconnect();
  }, [categories.length]);
  const move = (direction: -1 | 1) => scroller.current?.scrollBy({ left: direction * scroller.current.clientWidth, behavior: "smooth" });

  return <section aria-labelledby="popular-categories-heading">
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 id="popular-categories-heading" className="text-2xl font-bold">Popular categories</h2>
      <div className="flex gap-2" aria-label="Popular category controls">
        <Button variant="secondary" size="icon" disabled={!canPrevious} aria-label="Previous categories" onClick={() => move(-1)}><ChevronIcon className="h-5 w-5" /></Button>
        <Button variant="secondary" size="icon" disabled={!canNext} aria-label="Next categories" onClick={() => move(1)}><ChevronIcon direction="right" className="h-5 w-5" /></Button>
      </div>
    </div>
    <div ref={scroller} onScroll={updateControls} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3" tabIndex={0} aria-label="Popular categories">
      {categories.map(category => <Link key={category.slug} href={`/products?category=${encodeURIComponent(category.slug)}`} className="group block basis-[82%] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-surface text-inherit no-underline transition hover:border-focus hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-3rem)/4)]">
        <div className="relative aspect-[4/3] bg-surface-muted"><Image src={category.image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 82vw" className="object-contain p-5 transition-transform duration-300 group-hover:scale-105" /></div>
        <div className="p-4"><h3 className="text-lg font-semibold">{category.title}</h3><p className="mt-1 text-sm text-text-muted group-hover:underline">Shop category</p></div>
      </Link>)}
    </div>
  </section>;
}
