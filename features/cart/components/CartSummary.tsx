"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  layout?: "drawer" | "page";
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
}

export default function CartSummary({
  subtotal,
  itemCount,
  layout = "drawer",
  onCheckout,
  checkoutDisabled = false,
}: CartSummaryProps) {
  const router = useRouter();

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      router.push("/checkout");
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isDisabled = checkoutDisabled || itemCount === 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-muted)]">
          Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {formatPrice(subtotal)}
        </span>
      </div>

      {/* Delivery fee */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-muted)]">Delivery Fee</span>
        <span className="text-xs text-[var(--text-muted)] italic">
          Calculated at checkout
        </span>
      </div>

      <hr className="border-[var(--border-default)]" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-[var(--text-primary)]">Total</span>
        <span className="text-lg font-bold text-[var(--accent-secondary)]">
          {formatPrice(subtotal)}
        </span>
      </div>

      {/* Proceed to Checkout */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isDisabled}
        className={[
          "clay-button clay-hover-lift",
          "flex items-center justify-center gap-2",
          "w-full rounded-[12px] px-6 py-3",
          "text-base font-semibold",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2",
          "cursor-pointer",
          isDisabled
            ? "opacity-50 cursor-not-allowed bg-[var(--border-default)] text-[var(--text-muted)]"
            : "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)] hover:bg-[var(--accent-primary-hover)] active:scale-95",
        ].join(" ")}
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        <span>Proceed to Checkout</span>
      </button>


    </div>
  );
}
