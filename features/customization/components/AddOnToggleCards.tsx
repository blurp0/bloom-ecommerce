"use client";

import { Check, ImageIcon } from "lucide-react";
import { useCustomizationStore } from "@/features/customization/store";

interface AddOnData {
  id: string;
  name: string;
  price: number;
  image?: string | null;
}

interface AddOnToggleCardsProps {
  addOns: AddOnData[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * AddOnToggleCards — grid of toggle cards for add-ons.
 * Each card shows image, name, price, and a checked state ring.
 * Toggles selection in the customization store on click.
 */
export default function AddOnToggleCards({ addOns }: AddOnToggleCardsProps) {
  const { selectedAddOnIds, toggleAddOn } = useCustomizationStore();

  if (addOns.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <ImageIcon className="h-10 w-10 text-[var(--text-muted)]" aria-hidden="true" />
        <p className="text-sm text-[var(--text-muted)]">
          No add-ons available for this product.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {addOns.map((addOn) => {
        const isSelected = selectedAddOnIds.includes(addOn.id);

        return (
          <button
            key={addOn.id}
            type="button"
            onClick={() => toggleAddOn(addOn.id)}
            aria-pressed={isSelected}
            className={[
              "relative flex items-center gap-4 p-3 rounded-[16px] border-2 text-left",
              "transition-all duration-200 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              isSelected
                ? "bg-[var(--bg-surface)] border-[var(--accent-primary)] shadow-md"
                : "bg-[var(--bg-surface)] border-[var(--border-interactive)] hover:border-[var(--accent-primary)] hover:shadow-sm",
            ].join(" ")}
          >
            {/* Image thumbnail */}
            <div className="flex-shrink-0 w-16 h-16 rounded-[12px] bg-[var(--bg-elevated)] overflow-hidden flex items-center justify-center">
              {addOn.image ? (
                <img
                  src={addOn.image}
                  alt={addOn.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-[var(--text-muted)]" aria-hidden="true" />
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {addOn.name}
              </span>
              <span className="text-sm font-bold text-[var(--accent-secondary)]">
                {formatPrice(addOn.price)}
              </span>
            </div>

            {/* Check indicator */}
            <div
              className={[
                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                "transition-colors duration-200",
                isSelected
                  ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
                  : "bg-transparent border-[var(--border-interactive)]",
              ].join(" ")}
            >
              {isSelected && (
                <Check className="h-3.5 w-3.5 text-[var(--accent-primary-foreground)]" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}