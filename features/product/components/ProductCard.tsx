import Image from "next/image";
import Link from "next/link";
import RatingBadge from "@/features/review/components/RatingBadge";
import type { ProductCardProduct } from "../types";
import { formatPrice } from "../utils/formatting";

type ProductCardProps = {
  product: ProductCardProduct;
};

/**
 * ProductCard — a single claymorphic product card.
 *
 * Renders an image, product title, formatted price, and review rating
 * (if available). The entire card is wrapped in a <Link> to the product
 * detail page for keyboard and touch accessibility.
 *
 * Design tokens:
 *   - `clay-card` — claymorphism shadow / hover lift (globals.css)
 *   - `rounded-[16px]` — card-level border radius (per ui-ux-context.md)
 *   - `border-border-default` — decorative outline only
 *   - `focus-visible:ring-2 ring-[var(--accent-primary)]` — keyboard focus
 */
export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className={[
        "clay-card",
        "clay-hover-lift",
        "group",
        "flex flex-col overflow-hidden",
        "border border-border-default",
        "rounded-[16px]",
        "bg-surface",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
        "focus-visible:ring-offset-2",
        "cursor-pointer",
      ].join(" ")}
    >
      {/* Image container — fixed aspect ratio for CLS mitigation */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-elevated">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <span className="text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Product title */}
        <h3 className="font-body font-semibold text-body text-text-primary line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <p className="font-body text-base font-semibold text-accent-secondary">
          {formatPrice(product.basePrice)}
        </p>

        {/* Review rating */}
        <div className="mt-auto">
          <RatingBadge
            rating={product.averageRating ?? 0}
            count={product.reviewCount}
            size="small"
          />
        </div>

        {/* CTA */}
        <div className="mt-1">
          <span className="inline-block text-sm font-medium text-accent-secondary transition-colors duration-200 ease-out group-hover:text-accent-secondary-hover">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
