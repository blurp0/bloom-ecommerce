"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import ProductGallery, { GalleryImage } from "./ProductGallery";
import RatingBadge from "@/features/review/components/RatingBadge";
import ReviewList from "@/features/review/components/ReviewList";
import { useReviews } from "@/features/review/hooks/useReviews";

interface Variant {
  id: string;
  name: string;
  price: number;
  color?: string | null;
}

export interface ProductDetailData {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  categories: { name: string; slug: string }[];
  images: GalleryImage[];
  variants: Variant[];
}

type ProductDetailProps = {
  product: ProductDetailData;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * ProductDetail — interactive client component for the PDP.
 *
 * Handles variant selection (updates displayed price), gallery,
 * rating display, and the primary CTA ("Customize Bouquet").
 *
 * Mobile: CTA is sticky at the bottom of the viewport.
 * Desktop: CTA is inline in the right column.
 */
export default function ProductDetail({ product }: ProductDetailProps) {
  // Collect unique colors from variants for color picker
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => v.color).filter((c): c is string => !!c))
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    uniqueColors.length === 1 ? (uniqueColors[0] ?? null) : null
  );
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] ?? null
  );

  const {
    reviews,
    stats,
    isLoading: reviewsLoading,
    hasMore,
    loadOlder,
    isLoadOlderLoading,
  } = useReviews(product.id);

  // Treat `variant.price` as a price adjustment relative to the product base price.
  // This matches the customization studio's pricing model where the studio
  // combines basePrice with the variant adjustment.
  // When both color and size are selected, find matching variant
  const actualVariant =
    selectedColor && selectedVariant
      ? product.variants.find(
          (v) => v.name === selectedVariant.name && v.color === selectedColor,
        ) ?? selectedVariant
      : selectedVariant;

  const displayPrice = actualVariant
    ? product.basePrice + actualVariant.price
    : product.basePrice;

  const ctaHref = `/customization/${product.id}${actualVariant ? `?variantId=${actualVariant.id}&variantName=${encodeURIComponent(actualVariant.name)}` : ""}`;

  return (
    <>
      {/* Main layout: gallery left, details right on desktop */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Details column */}
        <div className="flex flex-col gap-5">
          {/* Title */}
          <h1 className="font-heading text-[2rem] leading-tight text-[var(--text-primary)]">
            {product.name}
          </h1>

          {/* Rating — hidden while loading to avoid "No ratings yet" flash */}
          {!reviewsLoading && (
            <RatingBadge
              rating={stats.averageRating}
              count={stats.totalReviews}
              size="default"
              href="#reviews"
            />
          )}

          {/* Price */}
          <p className="text-2xl font-semibold text-[var(--accent-secondary)]">
            {formatPrice(displayPrice)}
          </p>

          {/* Description */}
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            {product.description}
          </p>

          {/* Color selector */}
          {uniqueColors.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Color
              </span>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color ?? null)}
                    aria-pressed={selectedColor === color}
                    className={[
                      "px-4 py-2 rounded-[9999px] text-sm font-medium border transition-all duration-150 cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                      selectedColor === color
                        ? "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)] border-[var(--accent-primary)]"
                        : "bg-transparent text-[var(--text-primary)] border-[var(--border-interactive)] hover:border-[var(--accent-primary)]",
                    ].join(" ")}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant selector (size) */}
          {product.variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Size
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  ...new Map(
                    product.variants
                      .filter((v) => !selectedColor || v.color === selectedColor)
                      .map((v) => [v.name, v]),
                  ).values(),
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    aria-pressed={selectedVariant?.name === v.name}
                    className={[
                      "px-4 py-2 rounded-[9999px] text-sm font-medium border transition-all duration-150 cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                      selectedVariant?.name === v.name
                        ? "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)] border-[var(--accent-primary)]"
                        : "bg-transparent text-[var(--text-primary)] border-[var(--border-interactive)] hover:border-[var(--accent-primary)]",
                    ].join(" ")}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop CTA */}
          <div className="hidden lg:block mt-2">
            <Link
              href={ctaHref}
              className={[
                "clay-button clay-hover-lift",
                "inline-flex items-center justify-center",
                "w-full rounded-[12px] px-6 py-3",
                "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
                "text-base font-semibold",
                "transition-transform duration-200 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2",
                "cursor-pointer",
              ].join(" ")}
            >
              Customize Bouquet
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <section id="reviews" className="mt-12 flex flex-col gap-6">
        <h2 className="font-heading text-2xl text-[var(--text-primary)]">
          Reviews
        </h2>

        <ReviewList
          reviews={reviews}
          isLoading={reviewsLoading}
          hasMore={hasMore}
          onLoadOlder={loadOlder}
          isLoadOlderLoading={isLoadOlderLoading}
        />
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 lg:hidden bg-[var(--bg-surface)] border-t border-[var(--border-default)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Link
          href={ctaHref}
          className={[
            "clay-button clay-hover-lift",
            "flex items-center justify-center",
            "w-full rounded-[12px] px-6 py-3",
            "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
            "text-base font-semibold",
            "transition-transform duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2",
            "cursor-pointer",
          ].join(" ")}
        >
          Customize Bouquet
        </Link>
      </div>
    </>
  );
}
