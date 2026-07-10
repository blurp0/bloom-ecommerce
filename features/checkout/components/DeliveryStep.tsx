"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeliverySchema, type DeliveryData } from "@/lib/validators/checkout";
import { useCheckoutStore } from "../store/checkout-store";

interface DeliveryStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 2: Delivery Schedule.
 *
 * Collects preferred delivery date and time slot.
 * Stub — content filled in spec 034.
 */
export default function DeliveryStep({ onNext, onBack }: DeliveryStepProps) {
  const deliveryDate = useCheckoutStore((s) => s.deliveryDate);
  const timeSlot = useCheckoutStore((s) => s.timeSlot);
  const setDeliveryDate = useCheckoutStore((s) => s.setDeliveryDate);
  const setTimeSlot = useCheckoutStore((s) => s.setTimeSlot);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryData>({
    resolver: zodResolver(DeliverySchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      deliveryDate,
      timeSlot: timeSlot ?? undefined,
    },
  });

  const onSubmit = (data: DeliveryData) => {
    setDeliveryDate(data.deliveryDate);
    setTimeSlot(data.timeSlot);
    onNext();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Delivery Schedule
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          When would you like your bouquet delivered?
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-md">
        {/* Delivery Date */}
        <div>
          <label
            htmlFor="delivery-date"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Preferred Delivery Date
          </label>
          <input
            id="delivery-date"
            type="date"
            min={today}
            autoComplete="off"
            {...register("deliveryDate")}
            className={[
              "w-full rounded-[12px] border px-4 py-2.5 text-base text-[var(--text-primary)]",
              "bg-[var(--bg-surface)]",
              "border-[var(--border-interactive)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "transition-colors duration-200",
              errors.deliveryDate && "border-[var(--state-error)]",
            ].join(" ")}
          />
          {errors.deliveryDate && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.deliveryDate.message}
            </p>
          )}
        </div>

        {/* Time Slot */}
        <fieldset>
          <legend className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Preferred Time Slot
          </legend>
          <div className="flex flex-col gap-2">
            {[
              { value: "MORNING", label: "Morning (8AM – 12PM)" },
              { value: "AFTERNOON", label: "Afternoon (12PM – 5PM)" },
              { value: "EVENING", label: "Evening (5PM – 8PM)" },
            ].map((slot) => (
              <label
                key={slot.value}
                className={[
                  "flex items-center gap-3 rounded-[12px] border px-4 py-3 cursor-pointer",
                  "transition-colors duration-200",
                  "hover:bg-[var(--bg-elevated)]",
                  "border-[var(--border-default)]",
                  "has-[:checked]:border-[var(--accent-primary)] has-[:checked]:bg-[var(--bg-elevated)]",
                ].join(" ")}
              >
                <input
                  type="radio"
                  value={slot.value}
                  {...register("timeSlot")}
                  className="h-4 w-4 text-[var(--accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer"
                />
                <span className="text-sm text-[var(--text-primary)]">
                  {slot.label}
                </span>
              </label>
            ))}
          </div>
          {errors.timeSlot && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.timeSlot.message}
            </p>
          )}
        </fieldset>
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