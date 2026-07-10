"use client";

import { useCheckoutStore } from "../store/checkout-store";

interface ReviewStepProps {
  onBack: () => void;
}

/**
 * Step 4: Review & Confirm.
 *
 * Displays a full order summary before placement.
 * Stub — content filled in spec 036. "Place Order" button is disabled for now.
 */
export default function ReviewStep({ onBack }: ReviewStepProps) {
  const { address, deliveryDate, timeSlot, paymentMethod, isSubmitting } =
    useCheckoutStore();

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
      <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-clay-md">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Order Summary
        </h3>

        {/* Delivery Address */}
        <section className="mb-4">
          <h4 className="text-sm font-medium text-[var(--text-muted)] mb-1">
            Delivery Address
          </h4>
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
          <h4 className="text-sm font-medium text-[var(--text-muted)] mb-1">
            Delivery Schedule
          </h4>
          <p className="text-sm text-[var(--text-primary)]">
            {deliveryDate || "—"} &middot; {timeSlotLabel}
          </p>
        </section>

        <div className="h-px bg-[var(--border-default)] my-4" />

        {/* Payment Method */}
        <section className="mb-4">
          <h4 className="text-sm font-medium text-[var(--text-muted)] mb-1">
            Payment Method
          </h4>
          <p className="text-sm text-[var(--text-primary)]">{paymentLabel}</p>
        </section>

        <div className="h-px bg-[var(--border-default)] my-4" />

        {/* Cart items placeholder */}
        <section>
          <h4 className="text-sm font-medium text-[var(--text-muted)] mb-1">
            Items
          </h4>
          <p className="text-sm text-[var(--text-muted)] italic">
            Cart items will appear here (spec 036).
          </p>
        </section>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
        <button
          type="button"
          onClick={onBack}
          className={[
            "rounded-[12px] px-6 py-2.5 text-sm font-semibold",
            "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            "bg-[var(--bg-surface)] border border-[var(--border-default)]",
            "hover:bg-[var(--bg-elevated)] active:scale-95",
            "transition-all duration-200 ease-out cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
          ].join(" ")}
        >
          Back
        </button>
        <button
          type="button"
          disabled
          className={[
            "clay-button",
            "rounded-[12px] px-8 py-2.5 text-sm font-semibold",
            "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
            "opacity-50 cursor-not-allowed",
            "transition-all duration-200 ease-out",
          ].join(" ")}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}