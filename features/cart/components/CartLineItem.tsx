"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { ChevronDown, ChevronUp, Trash2, ImageIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CartItemResult } from "../hooks/useCart";
import QuantityStepper from "./QuantityStepper";

interface CartLineItemProps {
  item: CartItemResult;
  expandedByDefault?: boolean;
  selected?: boolean;
  onToggleSelect?: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  quantityDebounceMs?: number;
  showCheckbox?: boolean;
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};

function getCustomizationSummary(customization: Record<string, unknown>): {
  size?: string;
  color?: string;
  addOns: string[];
  messagePreview: string | null;
} {
  const size = typeof customization.size === "string" ? customization.size : undefined;
  const color = typeof customization.color === "string" ? customization.color : undefined;

  let addOns: string[] = [];
  const rawAddOns = customization.addOns;
  if (Array.isArray(rawAddOns)) {
    addOns = rawAddOns.map((a: unknown) => {
      if (typeof a === "string") return a;
      if (a && typeof a === "object" && "name" in a) return (a as { name: string }).name;
      return String(a);
    });
  }

  const message = typeof customization.messageCard === "string" ? customization.messageCard : null;
  const messagePreview = message
    ? message.length > 60
      ? `${message.slice(0, 60)}…`
      : message
    : null;

  return { size, color, addOns, messagePreview };
}

export default function CartLineItem({
  item,
  expandedByDefault = false,
  selected = false,
  onToggleSelect,
  onQuantityChange,
  onRemove,
  quantityDebounceMs = 400,
  showCheckbox = false,
}: CartLineItemProps) {
  const [expanded, setExpanded] = useState(expandedByDefault);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailsId = `customization-details-${item.id}`;

  const customization = getCustomizationSummary(item.customization);
  const hasCustomization =
    !!customization.size ||
    !!customization.color ||
    customization.addOns.length > 0 ||
    !!customization.messagePreview;

  const handleQuantity = useCallback(
    (newQty: number) => {
      setLocalQuantity(newQty);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onQuantityChange(item.id, newQty);
      }, quantityDebounceMs);
    },
    [item.id, onQuantityChange, quantityDebounceMs]
  );

  return (
    <div className="clay-card flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        {/* Selection checkbox — shadcn Checkbox for consistent styling */}
        {showCheckbox && (
          <div className="flex-shrink-0 pt-5">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect?.(item.id)}
              aria-label={`Select ${item.productName}`}
              className="cursor-pointer"
            />
          </div>
        )}

        {/* Product image — 80px for better visual weight on boutique items */}
        <div className="flex-shrink-0 w-20 h-20 rounded-[12px] bg-[var(--bg-elevated)] overflow-hidden flex items-center justify-center">
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="h-7 w-7 text-[var(--text-muted)]" aria-hidden="true" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {item.productName}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {formatPrice(item.unitPrice)} each
              </p>
            </div>

            {/* Remove button — padding extends touch target to ≥44px */}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.productName} from cart`}
              className={[
                "flex-shrink-0 flex items-center justify-center",
                "w-7 h-7 rounded-md",
                "p-[10px] -m-[10px]",
                "text-[var(--text-muted)] hover:text-[var(--state-error)]",
                "hover:bg-[var(--bg-elevated)] active:scale-95",
                "transition-all duration-150 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              ].join(" ")}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Quantity + line total row */}
          <div className="flex items-center justify-between mt-2">
            <QuantityStepper
              value={localQuantity}
              size="sm"
              onChange={handleQuantity}
            />
            <span className="text-sm font-bold text-[var(--accent-secondary)]">
              {formatPrice(item.itemTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Customization expand toggle */}
      {hasCustomization && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            aria-label={expanded ? "Hide customization details" : "Show customization details"}
            className={[
              "flex items-center gap-1 text-xs font-medium",
              "text-[var(--text-muted)] hover:text-[var(--accent-secondary)]",
              "transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "rounded-md px-1 -ml-1",
            ].join(" ")}
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>Customization details</span>
          </button>

          {expanded && (
            <div
              id={detailsId}
              className="flex flex-col gap-1.5 text-xs text-[var(--text-primary)] pl-5 border-l-2 border-[var(--border-default)]"
            >
              {customization.size && (
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] font-medium w-12">Size:</span>
                  <span>{customization.size}</span>
                </div>
              )}
              {customization.color && (
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] font-medium w-12">Color:</span>
                  <span>{customization.color}</span>
                </div>
              )}
              {customization.addOns.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] font-medium w-12">Add-ons:</span>
                  <span>{customization.addOns.join(", ")}</span>
                </div>
              )}
              {customization.messagePreview && (
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] font-medium w-12">Message:</span>
                  <span className="italic">&ldquo;{customization.messagePreview}&rdquo;</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
