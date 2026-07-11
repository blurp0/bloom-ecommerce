"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DeliverySchema, type DeliveryData } from "@/lib/validators/checkout";
import { useCheckoutStore } from "../store/checkout-store";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface DeliveryStepProps {
  onNext: () => void;
  onBack: () => void;
}

const TIME_SLOTS = [
  { value: "MORNING" as const, label: "Morning (8AM – 12PM)" },
  { value: "AFTERNOON" as const, label: "Afternoon (12PM – 5PM)" },
  { value: "EVENING" as const, label: "Evening (5PM – 8PM)" },
];

/**
 * Step 2: Delivery Preference.
 *
 * Buyer submits a preferred date and time slot. These are requests only —
 * the seller reviews and confirms (or proposes an alternative) via the
 * order chat after the order is placed.
 */
export default function DeliveryStep({ onNext, onBack }: DeliveryStepProps) {
  const deliveryDate = useCheckoutStore((s) => s.deliveryDate);
  const timeSlot = useCheckoutStore((s) => s.timeSlot);
  const setDeliveryDate = useCheckoutStore((s) => s.setDeliveryDate);
  const setTimeSlot = useCheckoutStore((s) => s.setTimeSlot);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    deliveryDate ? new Date(deliveryDate + "T00:00:00") : undefined
  );

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
  } = useForm<DeliveryData>({
    resolver: zodResolver(DeliverySchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      deliveryDate,
      timeSlot: timeSlot ?? undefined,
    },
  });

  /** Minimum date: tomorrow (at least 1 day from today). */
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  /** Disable dates that are today or in the past. */
  const isDayDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    const isoDate = format(date, "yyyy-MM-dd");
    setValue("deliveryDate", isoDate, { shouldValidate: true });
    setDeliveryDate(isoDate);
    setCalendarOpen(false);
    trigger("deliveryDate");
  };

  const handleTimeSlotChange = (slot: string) => {
    const value = slot as "MORNING" | "AFTERNOON" | "EVENING";
    setValue("timeSlot", value, { shouldValidate: true });
    setTimeSlot(value);
    trigger("timeSlot");
  };

  const onSubmit = (data: DeliveryData) => {
    setDeliveryDate(data.deliveryDate);
    setTimeSlot(data.timeSlot);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Delivery Preference
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Let us know your preferred date and time. We&apos;ll confirm availability with you after your order is placed.
        </p>
      </div>

      {/* Availability notice */}
      <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 flex gap-3">
        <span className="text-base leading-none mt-0.5">📅</span>
        <p className="text-sm text-[var(--text-muted)]">
          Your preferred schedule is a <span className="font-medium text-[var(--text-primary)]">request, not a guaranteed slot</span>. Our team will reach out via order chat to confirm or suggest an alternative.
        </p>
      </div>

      <div className="flex flex-col gap-6 max-w-md">
        {/* Delivery Date — Calendar Popover */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Preferred Date
          </label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger
              className={[
                "w-full justify-start text-left font-normal",
                "rounded-[12px] border px-4 py-2.5 h-auto",
                "bg-[var(--bg-surface)]",
                "border-[var(--border-interactive)]",
                "hover:bg-[var(--bg-elevated)]",
                "flex items-center gap-2 cursor-pointer",
                "text-[var(--text-primary)]",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                !selectedDate && "text-[var(--text-muted)]",
              ].join(" ")}
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span>
                {selectedDate
                  ? format(selectedDate, "PPP")
                  : "Pick a preferred date"}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDayDisabled}
              />
            </PopoverContent>
          </Popover>
          {errors.deliveryDate && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.deliveryDate.message}
            </p>
          )}
        </div>

        {/* Time Slot */}
        <fieldset>
          <legend className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Preferred Time Window
          </legend>
          <div className="flex flex-col gap-2">
            {TIME_SLOTS.map((slot) => (
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
                  checked={timeSlot === slot.value}
                  onChange={() => handleTimeSlotChange(slot.value)}
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