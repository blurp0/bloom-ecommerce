"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { useProducts } from "@/features/product/hooks/useProducts";
import { SkeletonCardGrid } from "@/components/shared/Skeletons";
import { formatPrice } from "@/features/customization/utils/pricing";

/**
 * CustomizationLanding — fetches suggested products (featured, then all)
 * and renders them as clickable cards that link to the customization studio.
 *
 * Shows up to 8 products. Each card links to
 * `/customization/[productId]` to enter the studio with that product
 * pre-loaded.
 */
export default function CustomizationLanding() {
  const {
    data: featuredData,
    isLoading: featuredLoading,
    isError: featuredError,
  } = useProducts({ featured: true, limit: 8 });

  const featuredProducts = featuredData?.products ?? [];
  const hasFeatured = featuredProducts.length > 0;

  const {
    data: fallbackData,
    isLoading: fallbackLoading,
    isError: fallbackError,
  } = useProducts({ limit: 8 }, { enabled: !featuredLoading && !hasFeatured });

  const isLoading = featuredLoading || (!hasFeatured && fallbackLoading);

  if (isLoading) {
    return <SkeletonCardGrid count={8} />;
  }

  if (featuredError || fallbackError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-base text-[var(--state-error)]">
          Failed to load products. Please try again later.
        </p>
      </div>
    );
  }

  const products = hasFeatured ? featuredProducts : (fallbackData?.products ?? []);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-base text-[var(--text-muted)]">
          No products available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Suggested products to customize">
      <h2 className="sr-only">Suggested Designs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const primaryImage = product.images[0];

          return (
            <Link
              key={product.id}
              href={`/customization/${product.id}`}
              className={[
                "clay-card clay-hover-lift group",
                "flex flex-col overflow-hidden",
                "border border-border-default rounded-[16px]",
                "bg-[var(--bg-surface)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                "cursor-pointer",
              ].join(" ")}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-elevated)]">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.alt ?? product.name}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                    <span className="text-sm">No Image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-body font-semibold text-base text-[var(--text-primary)] line-clamp-2">
                  {product.name}
                </h3>

                <p className="font-body text-base font-semibold text-[var(--accent-secondary)]">
                  {formatPrice(product.basePrice)}
                </p>

                {/* Rating */}
                {product.averageRating !== null && product.reviewCount > 0 && (
                  <div
                    className="mt-auto flex items-center gap-1.5"
                    aria-label={`Rated ${product.averageRating} out of 5 based on ${product.reviewCount} review${product.reviewCount === 1 ? "" : "s"}`}
                  >
                    <div className="flex items-center" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={[
                            "h-3.5 w-3.5",
                            star <= Math.round(product.averageRating ?? 0)
                              ? "fill-[var(--accent-primary)] text-[var(--accent-primary)]"
                              : "fill-none text-[var(--border-default)]",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      ({product.reviewCount})
                    </span>
                  </div>
                )}

                {/* Customize CTA */}
                <div className="mt-1">
                  <span className="inline-block text-sm font-medium text-[var(--accent-secondary)] transition-colors duration-200 group-hover:text-[var(--accent-secondary-hover)]">
                    Customize This &rarr;
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
