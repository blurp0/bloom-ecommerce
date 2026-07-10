"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Wallet, CircleDollarSign, MessageSquare } from "lucide-react";
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
 * No payment processor integration — selection only.
 */
export default function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
  const [selected, setSelected] = useState<string | undefined>(paymentMethod ?? undefined);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentData>({
    resolver: zodResolver(PaymentSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      paymentMethod: paymentMethod ?? undefined,
    },
  });

  const watchedPaymentMethod = watch("paymentMethod");

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
            description: "Pay in cash when your order arrives",
            Icon: CircleDollarSign,
          },
          {
            value: "EWALLET" as const,
            label: "E-Wallet Transfer",
            description: "Transfer via GCash or Maya before delivery; seller will confirm receipt",
            Icon: Wallet,
          },
          {
            value: "MANUAL" as const,
            label: "Manual Arrangement",
            description: "Coordinate payment directly with the seller via messaging",
            Icon: MessageSquare,
          },
        ].map((method) => (
          <label
            key={method.value}
            className={[
              "flex items-start gap-4 rounded-[16px] border px-5 py-4 cursor-pointer",
              "transition-colors duration-200",
              "hover:bg-[var(--bg-elevated)]",
              "border-[var(--border-default)]",
              "has-[:checked]:border-[var(--accent-primary)]",
              "has-[:checked]:bg-[var(--bg-elevated)]",
              "min-h-[44px]",
            ].join(" ")}
          >
            <input
              type="radio"
              value={method.value}
              {...register("paymentMethod")}
              className="mt-0.5 h-4 w-4 text-[var(--accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer"
            />
            <method.Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            <div className="flex-1">
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
      <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border-default)]">
        <div className="flex items-center justify-between">
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
            disabled={!watchedPaymentMethod || isSubmitting}
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
        <div className="flex justify-center">
          <a
            href="/returns-policy"
            className="text-xs text-[var(--accent-primary)] hover:underline underline-offset-2"
          >
            View our Returns & Cancellation Policy
          </a>
        </div>
      </div>
    </form>
  );
}