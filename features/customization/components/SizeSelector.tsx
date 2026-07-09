"use client";

import { Check } from "lucide-react";
import { useCustomizationStore } from "@/features/customization/store";
import { formatPrice } from "@/features/customization/utils/pricing";

interface VariantData {
  id: string;
  name: string;
  price: number;
}

interface SizeSelectorProps {
  variants: VariantData[];
  basePrice: number;
}

/**
 * SizeSelector — renders variant cards with name, price delta badge,
 * and a selected ring. Updates the store via `setVariant` on click.
 *
 * If the product has no variants, renders a single "Default" card
 * indicating the base price.
 */
export default function SizeSelector({ variants, basePrice }: SizeSelectorProps) {
  const selectedVariantId = useCustomizationStore((s) => s.selectedVariantId);
  const setVariant = useCustomizationStore((s) => s.setVariant);

  // No variants available — show default option
  if (variants.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          This bouquet comes in one size. Price: {formatPrice(basePrice)}
        </p>
        <button
          type="button"
          disabled
          className={[
            "relative flex items-center gap-4 p-4 rounded-[16px] border-2 cursor-default",
            "bg-[var(--bg-surface)] border-[var(--accent-primary)]",
            "transition-all duration-200",
          ].join(" ")}
          aria-pressed="true"
        >
          <div
            className={[
              "flex-shrink-0 w-12 h-12 rounded-[12px] flex items-center justify-center",
              "bg-[var(--accent-primary)]",
            ].join(" ")}
          >
            <Check className="h-5 w-5 text-[var(--accent-primary-foreground)]" />
          </div>
          <div className="flex flex-col gap-0.5 text-left flex-1">
            <span className="text-base font-semibold text-[var(--text-primary)]">
              Default Size
            </span>
            <span className="text-sm text-[var(--text-muted)]">
              {formatPrice(basePrice)}
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--text-muted)]">
        Select a size. Price adjusts based on your choice.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          // `variants[*].price` is treated as a price adjustment relative to base.
          const delta = variant.price;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => setVariant(variant.id)}
              aria-pressed={isSelected}
              className={[
                "relative flex flex-col gap-2 p-4 rounded-[16px] border-2 text-left",
                "transition-all duration-200 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                isSelected
                  ? "bg-[var(--bg-surface)] border-[var(--accent-primary)] shadow-md"
                  : "bg-[var(--bg-surface)] border-[var(--border-interactive)] hover:border-[var(--accent-primary)] hover:shadow-sm",
              ].join(" ")}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-[var(--accent-primary-foreground)]" />
                </div>
              )}

              {/* Variant name */}
              <span className="text-base font-semibold text-[var(--text-primary)]">
                {variant.name}
              </span>

              {/* Price */}
              <span className="text-lg font-bold text-[var(--accent-secondary)]">
                {formatPrice(basePrice + variant.price)}
              </span>

              {/* Price delta badge */}
              {delta !== 0 && (
                <span
                  className={[
                    "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full w-fit",
                    delta > 0
                      ? "bg-[var(--state-success)]/10 text-[var(--state-success)]"
                      : "bg-[var(--state-warning)]/10 text-[var(--state-warning)]",
                  ].join(" ")}
                >
                  {delta > 0 ? "+" : ""}
                  {formatPrice(delta)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}