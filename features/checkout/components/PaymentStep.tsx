"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentSchema, type PaymentData } from "@/lib/validators/checkout";
import { useCheckoutStore } from "../store/checkout-store";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 3: Payment Method.
 *
 * Selects between Cash on Delivery, E-wallet transfer, or Manual arrangement.
 * Stub — content filled in spec 035.
 */
export default function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentData>({
    resolver: zodResolver(PaymentSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      paymentMethod: paymentMethod ?? undefined,
    },
  });

  const onSubmit = (data: PaymentData) => {
    setPaymentMethod(data.paymentMethod);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Payment Method
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Choose how you'd like to pay. No payment is processed on this site.
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-md">
        {[
          {
            value: "COD" as const,
            label: "Cash on Delivery",
            description: "Pay in cash when your bouquet arrives.",
          },
          {
            value: "EWALLET" as const,
            label: "E-wallet Transfer",
            description: "Pay via GCash, Maya, or other e-wallet. Account details will be provided after ordering.",
          },
          {
            value: "MANUAL" as const,
            label: "Manual Arrangement",
            description: "Bank transfer or other arrangement. Instructions will be provided after ordering.",
          },
        ].map((method) => (
          <label
            key={method.value}
            className={[
              "flex items-start gap-3 rounded-[16px] border px-5 py-4 cursor-pointer",
              "transition-colors duration-200",
              "hover:bg-[var(--bg-elevated)]",
              "border-[var(--border-default)]",
              "has-[:checked]:border-[var(--accent-primary)] has-[:checked]:bg-[var(--bg-elevated)]",
            ].join(" ")}
          >
            <input
              type="radio"
              value={method.value}
              {...register("paymentMethod")}
              className="mt-0.5 h-4 w-4 text-[var(--accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer"
            />
            <div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {method.label}
              </span>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {method.description}
              </p>
            </div>
          </label>
        ))}
        {errors.paymentMethod && (
          <p className="text-xs text-[var(--state-error)]" role="alert">
            {errors.paymentMethod.message}
          </p>
        )}
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
          type="submit"
          disabled={isSubmitting}
          className={[
            "clay-button clay-hover-lift",
            "rounded-[12px] px-8 py-2.5 text-sm font-semibold",
            "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
            "hover:bg-[var(--accent-primary-hover)] active:scale-95",
            "transition-all duration-200 ease-out cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--accent-primary)]",
          ].join(" ")}
        >
          Next
        </button>
      </div>
    </form>
  );
}