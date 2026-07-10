"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * QuantityStepper — reusable +/- quantity control.
 * -
 * - min: 1 (default)
 * - max: 99
 * - onChange fires immediately; callers are expected to debounce any API calls
 *   (the spec says 400ms debounce on PUT).
 * - size controls the button dimensions: sm (28px), md (32px).
 */
export default function QuantityStepper({
  value,
  min = 1,
  max = 99,
  size = "md",
  onChange,
  disabled = false,
}: QuantityStepperProps) {
  // Touch targets must be ≥44px; use padding to extend hit area beyond visual bounds
  const btnClass =
    size === "sm"
      ? "w-7 h-7 rounded-full"
      : "w-8 h-8 rounded-full";

  const iconClass = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textClass = size === "sm" ? "w-6 text-center text-sm" : "w-8 text-center text-sm";
  // Wrapper padding extends touch target to ≥44px without changing visual size
  const hitAreaClass = "p-[10px] -m-[10px] rounded-full";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={[
          btnClass,
          hitAreaClass,
          "flex items-center justify-center",
          "border border-[var(--border-interactive)]",
          "text-[var(--text-primary)]",
          "transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
          disabled || value <= min
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-[var(--bg-elevated)] active:scale-95",
        ].join(" ")}
      >
        <Minus className={iconClass} aria-hidden="true" />
      </button>

      <span
        className={[
          textClass,
          "font-semibold text-[var(--text-primary)]",
        ].join(" ")}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={[
          btnClass,
          hitAreaClass,
          "flex items-center justify-center",
          "border border-[var(--border-interactive)]",
          "text-[var(--text-primary)]",
          "transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
          disabled || value >= max
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-[var(--bg-elevated)] active:scale-95",
        ].join(" ")}
      >
        <Plus className={iconClass} aria-hidden="true" />
      </button>
    </div>
  );
}