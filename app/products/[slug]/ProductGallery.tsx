"use client";

import { useState } from "react";

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);
  return <div className="grid gap-4 sm:grid-cols-[72px_minmax(0,1fr)]">
    {images.length > 1 && <div className="order-2 -m-1 flex gap-2 overflow-x-auto p-1 pb-2 sm:order-1 sm:m-0 sm:flex-col sm:overflow-visible sm:p-0" aria-label="Product images">
      {images.map((image, index) => <button key={image} type="button" onClick={() => setSelected(index)} aria-label={`View image ${index + 1} of ${images.length}`} aria-pressed={selected === index} className={`h-16 w-16 shrink-0 cursor-pointer rounded-md border bg-surface p-1 transition focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus ${selected === index ? "border-focus ring-2 ring-inset ring-focus" : "border-border hover:border-focus"}`}>
        <img src={image} alt="" className="h-full w-full object-contain" />
      </button>)}
    </div>}
    <div className="order-1 flex aspect-square min-w-0 items-center justify-center rounded-lg border border-border bg-surface-muted p-6 sm:order-2">
      <img src={images[selected]} alt={title} className="h-full w-full object-contain" draggable={false} />
    </div>
  </div>;
}
