"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import ProductGallery, { GalleryImage } from "./ProductGallery";

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

export interface ProductDetailData {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: { name: string; slug: string } | null;
  images: GalleryImage[];
  variants: Variant[];
  averageRating: number | null;
  reviewCount: number;
  reviews: Review[];
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

function StarRating({ rating, count }: { rating: number | null; count: number }) {
  if (count === 0 || rating === null) {
    return (
      <span className="text-sm text-[var(--text-muted)]">No Reviews Yet</span>
    );
  }
  return (
    <a
      href="#reviews"
      className="flex items-center gap-1.5 cursor-pointer group"
      aria-label={`Rated ${rating} out of 5 based on ${count} review${count === 1 ? "" : "s"}. Jump to reviews.`}
    >
      <div className="flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={[
              "h-4 w-4",
              star <= Math.round(rating)
                ? "fill-[var(--accent-primary)] text-[var(--accent-primary)]"
                : "fill-none text-[var(--border-default)]",
            ].join(" ")}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {rating}
      </span>
      <span className="text-sm text-[var(--text-muted)] group-hover:underline">
        ({count} {count === 1 ? "Review" : "Reviews"})
      </span>
    </a>
  );
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
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] ?? null
  );

  // Treat `variant.price` as a price adjustment relative to the product base price.
  // This matches the customization studio's pricing model where the studio
  // combines basePrice with the variant adjustment.
  const displayPrice = selectedVariant
    ? product.basePrice + selectedVariant.price
    : product.basePrice;

  const ctaHref = `/customization/${product.id}`;

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

          {/* Rating */}
          <StarRating rating={product.averageRating} count={product.reviewCount} />

          {/* Price */}
          <p className="text-2xl font-semibold text-[var(--accent-secondary)]">
            {formatPrice(displayPrice)}
          </p>

          {/* Description */}
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            {product.description}
          </p>

          {/* Variant selector */}
          {product.variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Size
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    aria-pressed={selectedVariant?.id === v.id}
                    className={[
                      "px-4 py-2 rounded-[9999px] text-sm font-medium border transition-all duration-150 cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                      selectedVariant?.id === v.id
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

        {product.reviews.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No reviews yet. Be the first to share your experience!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="clay-card rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={[
                          "h-3.5 w-3.5",
                          star <= review.rating
                            ? "fill-[var(--accent-primary)] text-[var(--accent-primary)]"
                            : "fill-none text-[var(--border-default)]",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {review.user.name ?? "Customer"}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">
                    {new Date(review.createdAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-[var(--text-muted)]">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
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
