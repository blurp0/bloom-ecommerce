"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutStore, type CheckoutStep } from "../store/checkout-store";
import { useCart } from "@/features/cart/hooks/useCart";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { Loader2, ShoppingBag } from "lucide-react";

interface ReviewStepProps {
  onBack: () => void;
}

/**
 * Step 4: Review & Confirm.
 *
 * Displays a full read-only order summary pulled from Zustand checkout store
 * + TanStack Query cart data. "Place Order" triggers POST /api/orders.
 */
export default function ReviewStep({ onBack }: ReviewStepProps) {
  const router = useRouter();
  const setStep = useCheckoutStore((s) => s.setStep);
  const { address, deliveryDate, timeSlot, paymentMethod, isSubmitting, reset, setSubmitting } =
    useCheckoutStore();
  const { data: cart, isLoading: cartLoading } = useCart();
  const createOrder = useCreateOrder();

  const timeSlotLabel =
    timeSlot === "MORNING"
      ? "Morning (8AM – 12PM)"
      : timeSlot === "AFTERNOON"
        ? "Afternoon (12PM – 5PM)"
        : timeSlot === "EVENING"
          ? "Evening (5PM – 8PM)"
          : "Not selected";

  const paymentLabel =
    paymentMethod === "COD"
      ? "Cash on Delivery"
      : paymentMethod === "EWALLET"
        ? "E-wallet Transfer"
        : paymentMethod === "MANUAL"
          ? "Manual Arrangement"
          : "Not selected";

  const handleEditStep = useCallback(
    (step: CheckoutStep) => {
      setStep(step);
    },
    [setStep],
  );

  const handlePlaceOrder = useCallback(async () => {
    if (!cart || !deliveryDate || !timeSlot || !paymentMethod) return;

    // Find the address ID - we need to use a real address ID.
    // If the user has saved addresses and selected one, addressId will be set.
    const addressId = address.addressId;
    if (!addressId) {
      // If no address ID was stored, we can't proceed.
      return;
    }

    // Get selected item IDs from cart and verify there are items to order
    const selectedItemIds = cart.items.map((item) => item.id);
    if (selectedItemIds.length === 0) return;

    setSubmitting(true);

    createOrder.mutate(
      {
        addressId,
        deliveryDate,
        timeSlot,
        paymentMethod,
        selectedItemIds,
      },
      {
        onSuccess: (data) => {
          reset();
          router.push(`/orders/${data.orderId}/confirmation`);
        },
        onSettled: () => {
          setSubmitting(false);
        },
      },
    );
  }, [cart, deliveryDate, timeSlot, paymentMethod, address.addressId, setSubmitting, createOrder, reset, router]);

  const itemCount = cart?.items.length ?? 0;
  const subtotal = cart?.subtotal ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Review & Confirm
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Please review your order details before placing.
        </p>
      </div>

      {/* Order summary card */}
      <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 md:p-6 shadow-clay-md">
        {/* Delivery Address */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-[var(--text-muted)]">
              Delivery Address
            </h4>
            <button
              type="button"
              onClick={() => handleEditStep(1)}
              className="text-xs font-semibold text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-sm"
            >
              Edit
            </button>
          </div>
          <p className="text-sm text-[var(--text-primary)]">
            {address.fullName || "—"}
            <br />
            {address.street || "—"}
            {address.barangay ? `, ${address.barangay}` : ""}
            <br />
            {address.city || "—"}
            {address.province ? `, ${address.province}` : ""} {address.zipCode || ""}
            <br />
            {address.phone || "—"}
          </p>
        </section>

        <div className="h-px bg-[var(--border-default)] my-4" />

        {/* Delivery Schedule */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-[var(--text-muted)]">
              Delivery Schedule
            </h4>
            <button
              type="button"
              onClick={() => handleEditStep(2)}
              className="text-xs font-semibold text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-sm"
            >
              Edit
            </button>
          </div>
          <p className="text-sm text-[var(--text-primary)]">
            {deliveryDate || "—"} &middot; {timeSlotLabel}
          </p>
        </section>

        <div className="h-px bg-[var(--border-default)] my-4" />

        {/* Payment Method */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-[var(--text-muted)]">
              Payment Method
            </h4>
            <button
              type="button"
              onClick={() => handleEditStep(3)}
              className="text-xs font-semibold text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-sm"
            >
              Edit
            </button>
          </div>
          <p className="text-sm text-[var(--text-primary)]">{paymentLabel}</p>
        </section>

        <div className="h-px bg-[var(--border-default)] my-4" />

        {/* Cart Items */}
        <section className="mb-4">
          <h4 className="text-sm font-medium text-[var(--text-muted)] mb-2">
            Items ({itemCount})
          </h4>
          {cartLoading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading items…
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">
              No items in cart
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3"
                >
                  {/* Product image */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-[var(--bg-surface)]">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>

                  {/* Item details */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {item.productName}
                    </p>
                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {[
                          (item.customization as Record<string, unknown>).size as string,
                          (item.customization as Record<string, unknown>).color as string,
                          (() => {
                            const raw = (item.customization as Record<string, unknown>).addOns;
                            if (!raw) return null;
                            if (Array.isArray(raw)) {
                              const names = raw
                                .map((a) => (a && typeof a === "object" ? (a as Record<string, unknown>).name : null))
                                .filter(Boolean) as string[];
                              return names.length > 0
                                ? `+${names.join(", ")}`
                                : `+${raw.length} add-on${raw.length !== 1 ? "s" : ""}`;
                            }
                            return null;
                          })(),
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Customized"}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[var(--text-muted)]">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        ₱{item.itemTotal.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="h-px bg-[var(--border-default)] my-4" />

        {/* Totals */}
        <section>
          <div className="flex items-center justify-between text-sm text-[var(--text-primary)] mb-1">
            <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
            <span>₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)] mb-2">
            <span>Delivery Fee</span>
            <span>Calculated by seller</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border-default)]">
            <span>Order Total</span>
            <span>₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </section>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={[
            "rounded-[12px] px-6 py-2.5 text-sm font-semibold",
            "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            "bg-[var(--bg-surface)] border border-[var(--border-default)]",
            "hover:bg-[var(--bg-elevated)] active:scale-95",
            "transition-all duration-200 ease-out cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
            isSubmitting ? "opacity-50 cursor-not-allowed" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isSubmitting || !deliveryDate || !timeSlot || !paymentMethod || !address.addressId || cartLoading || (cart?.items.length ?? 0) === 0}
          className={[
            "clay-button",
            "rounded-[12px] px-8 py-2.5 text-sm font-semibold",
            "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
            "hover:bg-[var(--accent-primary-hover)] active:scale-95",
            "transition-all duration-200 ease-out cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
            isSubmitting || !deliveryDate || !timeSlot || !paymentMethod || !address.addressId || cartLoading || (cart?.items.length ?? 0) === 0
              ? "opacity-50 cursor-not-allowed"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Placing Order…
            </span>
          ) : (
            "Place Order"
          )}
        </button>
      </div>
    </div>
  );
}