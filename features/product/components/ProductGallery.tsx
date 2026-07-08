"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

type ProductGalleryProps = {
  images: GalleryImage[];
  productName: string;
};

/**
 * ProductGallery — image gallery with thumbnail navigation (desktop)
 * and touch-swipe gesture support (mobile).
 *
 * Design tokens: bg-elevated for image container, border-default for
 * thumbnail borders, accent-primary for active thumbnail ring.
 */
export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const activeImage = images[activeIndex] ?? null;
  const hasMultiple = images.length > 1;

  function prev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-[16px] bg-[var(--bg-elevated)] border border-[var(--border-default)]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? productName}
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
            fetchPriority="high"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Mobile prev/next arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-surface)]/80 text-[var(--text-primary)] shadow-sm md:hidden cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-surface)]/80 text-[var(--text-primary)] shadow-sm md:hidden cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Desktop thumbnail strip */}
      {hasMultiple && (
        <div className="hidden md:flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1} of ${images.length}`}
              className={[
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[8px] border-2 cursor-pointer transition-all duration-150",
                idx === activeIndex
                  ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]"
                  : "border-[var(--border-default)] hover:border-[var(--border-interactive)]",
              ].join(" ")}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile dot indicators */}
      {hasMultiple && (
        <div className="flex justify-center gap-1.5 md:hidden" aria-hidden="true">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={[
                "h-1.5 w-1.5 rounded-full transition-all duration-150",
                idx === activeIndex
                  ? "bg-[var(--accent-primary)] w-3"
                  : "bg-[var(--border-default)]",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
