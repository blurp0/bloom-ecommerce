"use client";

import { Check } from "lucide-react";
import type { CheckoutStep } from "../store/checkout-store";

const STEP_LABELS: Record<CheckoutStep, string> = {
  1: "Address",
  2: "Delivery Schedule",
  3: "Payment Method",
  4: "Review & Confirm",
};

interface StepIndicatorProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
}

/**
 * Horizontal step indicator for the checkout flow.
 *
 * Desktop: full labels with numbered circles.
 * Mobile: compact top bar showing current/labels visually condensed.
 */
export default function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const steps = [1, 2, 3, 4] as CheckoutStep[];

  return (
    <nav aria-label="Checkout progress" className="w-full">
      {/* Desktop: horizontal row with labels */}
      <ol className="hidden md:flex items-center justify-center gap-0 w-full">
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const isClickable = isCompleted && !!onStepClick;

          return (
            <li key={step} className="flex items-center flex-1">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step)}
                className={[
                  "flex items-center gap-2 w-full py-3 px-2 transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-md",
                  isClickable ? "cursor-pointer" : "cursor-default",
                ].join(" ")}
                aria-current={isActive ? "step" : undefined}
              >
                {/* Step circle */}
                <span
                  className={[
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0",
                    "transition-colors duration-200",
                    isActive && "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
                    isCompleted && "bg-[var(--accent-secondary)] text-[var(--accent-secondary-foreground)]",
                    !isActive && !isCompleted && "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span>{step}</span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={[
                    "text-sm font-medium transition-colors duration-200",
                    isActive && "text-[var(--text-primary)]",
                    isCompleted && "text-[var(--text-muted)]",
                    !isActive && !isCompleted && "text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {STEP_LABELS[step]}
                </span>
              </button>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={[
                    "flex-1 h-px mx-2",
                    step < currentStep
                      ? "bg-[var(--accent-primary)]"
                      : "bg-[var(--border-default)]",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact top bar */}
      <div className="flex md:hidden items-center justify-between px-1">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Step {currentStep} of 4
        </span>
        <span className="text-sm text-[var(--text-muted)]">
          {STEP_LABELS[currentStep]}
        </span>
      </div>
    </nav>
  );
}