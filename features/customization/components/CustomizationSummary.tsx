"use client";

import { useRef, useState, useCallback } from "react";
import { Minus, Plus, ShoppingCart, ImageIcon } from "lucide-react";
import { useCustomizationStore } from "@/features/customization/store";
import { formatPrice, computePrice } from "@/features/customization/utils/pricing";

interface VariantData {
  id: string;
  name: string;
  price: number;
}

interface AddOnData {
  id: string;
  name: string;
  price: number;
}

interface ProductImageData {
  url: string;
  alt?: string | null;
}

interface CustomizationSummaryProps {
  productId: string;
  productName: string;
  basePrice: number;
  variants: VariantData[];
  addOns: AddOnData[];
  images: ProductImageData[];
  hasVariants: boolean;
}

/**
 * CustomizationSummary — sticky panel (desktop right / mobile bottom bar).
 *
 * Shows product thumbnail, selected variant name, selected add-on names,
 * truncated message preview, running price, quantity stepper, and
 * Add to Cart button.
 *
 * "Add to Cart" shows an "Adding..." text swap while animating (600ms),
 * then resets the store.
 */
export default function CustomizationSummary({
  productId: _productId,
  productName,
  basePrice,
  variants,
  addOns,
  images,
  hasVariants,
}: CustomizationSummaryProps) {
  const selectedVariantId = useCustomizationStore((s) => s.selectedVariantId);
  const selectedAddOnIds = useCustomizationStore((s) => s.selectedAddOnIds);
  const messageCardText = useCustomizationStore((s) => s.messageCardText);
  const quantity = useCustomizationStore((s) => s.quantity);
  const setQuantity = useCustomizationStore((s) => s.setQuantity);
  const reset = useCustomizationStore((s) => s.reset);

  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedVariant = selectedVariantId
    ? variants.find((v) => v.id === selectedVariantId)
    : undefined;

  const unitPrice = computePrice(
    basePrice,
    selectedVariant ? selectedVariant.price - basePrice : null,
    selectedAddOnIds
      .map((id) => addOns.find((a) => a.id === id)?.price ?? 0)
      .filter((p) => p > 0)
  );
  const lineTotal = computePrice(unitPrice, null, Array(quantity - 1).fill(unitPrice));

  const hasVariantSelected = !hasVariants || selectedVariantId !== null;
  const isAddToCartDisabled = !hasVariantSelected;

  const selectedAddOnObjects = addOns.filter((a) => selectedAddOnIds.includes(a.id));
  const thumbnail = images[0];

  const handleAddToCart = useCallback(() => {
    if (isAddToCartDisabled) return;

    const html = document.documentElement;
    const prefersReducedMotion =
      html.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setIsAnimating(true);
      setTimeout(() => {
        reset();
        setIsAnimating(false);
      }, 300);
      return;
    }

    setIsAnimating(true);

    // After animation completes (600ms), reset
    setTimeout(() => {
      reset();
      setIsAnimating(false);
    }, 600);
  }, [isAddToCartDisabled, reset]);

  const addOnLabels = selectedAddOnObjects.map((a) => a.name);
  const messagePreview = messageCardText
    ? messageCardText.length > 60
      ? `${messageCardText.slice(0, 60)}...`
      : messageCardText
    : null;

  return (
    <>
      {/* Desktop: sticky right panel */}
      <aside
        className={[
          "hidden lg:flex flex-col gap-5",
          "sticky top-24 self-start",
          "w-full max-w-sm",
          "rounded-[16px] border border-[var(--border-default)]",
          "bg-[var(--bg-surface)] p-5",
          "shadow-clay-md",
        ].join(" ")}
      >
        {/* Product info */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-14 h-14 rounded-[12px] bg-[var(--bg-elevated)] overflow-hidden flex items-center justify-center">
            {thumbnail ? (
              <img
                src={thumbnail.url}
                alt={thumbnail.alt ?? productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-[var(--text-muted)]" aria-hidden="true" />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {productName}
            </span>
            {selectedVariant && (
              <span className="text-xs text-[var(--text-muted)]">
                {selectedVariant.name}
              </span>
            )}
          </div>
        </div>

        {/* Selected add-ons */}
        {addOnLabels.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--text-muted)]">Add-Ons</span>
            <ul className="flex flex-wrap gap-1.5">
              {addOnLabels.map((label) => (
                <li
                  key={label}
                  className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Message preview */}
        {messagePreview && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--text-muted)]">Message</span>
            <p className="text-xs text-[var(--text-primary)] italic">
              &ldquo;{messagePreview}&rdquo;
            </p>
          </div>
        )}

        <hr className="border-[var(--border-default)]" />

        {/* Quantity stepper */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-primary)]">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity(quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center",
                "border border-[var(--border-interactive)]",
                "text-[var(--text-primary)]",
                "transition-colors duration-150 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                quantity <= 1
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-[var(--bg-elevated)]",
              ].join(" ")}
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span
              className="w-8 text-center text-sm font-semibold text-[var(--text-primary)]"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center",
                "border border-[var(--border-interactive)]",
                "text-[var(--text-primary)]",
                "transition-colors duration-150 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                "hover:bg-[var(--bg-elevated)]",
              ].join(" ")}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-primary)]">Total</span>
          <span className="text-xl font-bold text-[var(--accent-secondary)]">
            {formatPrice(lineTotal)}
          </span>
        </div>

        {/* Add to Cart */}
        <button
          ref={buttonRef}
          type="button"
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled || isAnimating}
          className={[
            "clay-button clay-hover-lift",
            "flex items-center justify-center gap-2",
            "w-full rounded-[12px] px-6 py-3",
            "text-base font-semibold",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2",
            "cursor-pointer",
            isAddToCartDisabled || isAnimating
              ? "opacity-50 cursor-not-allowed"
              : "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)] hover:bg-[var(--accent-primary-hover)]",
          ].join(" ")}
        >
          {isAnimating ? (
            <span>Adding...</span>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </aside>

      {/* Mobile: sticky bottom bar */}
      <div
        className={[
          "fixed bottom-0 left-0 right-0 z-20 lg:hidden",
          "bg-[var(--bg-surface)] border-t border-[var(--border-default)]",
          "p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
          "flex items-center justify-between gap-3",
        ].join(" ")}
      >
        {/* Price */}
        <div className="flex flex-col">
          <span className="text-xs text-[var(--text-muted)]">Total</span>
          <span className="text-lg font-bold text-[var(--accent-secondary)]">
            {formatPrice(lineTotal)}
          </span>
        </div>

        {/* Quantity stepper (compact) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className={[
              "w-7 h-7 rounded-full flex items-center justify-center",
              "border border-[var(--border-interactive)]",
              "text-[var(--text-primary)]",
              "transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              quantity <= 1 ? "opacity-40 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <Minus className="h-3 w-3" aria-hidden="true" />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-[var(--text-primary)]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Increase quantity"
            className={[
              "w-7 h-7 rounded-full flex items-center justify-center",
              "border border-[var(--border-interactive)]",
              "text-[var(--text-primary)]",
              "transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "hover:bg-[var(--bg-elevated)]",
            ].join(" ")}
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled || isAnimating}
          className={[
            "clay-button",
            "flex items-center justify-center gap-1.5",
            "rounded-[12px] px-4 py-2.5 flex-shrink-0",
            "text-sm font-semibold",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
            "cursor-pointer",
            isAddToCartDisabled || isAnimating
              ? "opacity-50 cursor-not-allowed bg-[var(--border-default)] text-[var(--text-muted)]"
              : "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)] hover:bg-[var(--accent-primary-hover)]",
          ].join(" ")}
        >
          {isAnimating ? (
            <span>Adding...</span>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
