"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useCustomizationStore } from "@/features/customization/store";
import SizeSelector from "./SizeSelector";
import AddOnToggleCards from "./AddOnToggleCards";
import MessageCardInput from "./MessageCardInput";
import CustomizationSummary from "./CustomizationSummary";

interface VariantData {
  id: string;
  name: string;
  price: number;
  color?: string;
}

interface AddOnData {
  id: string;
  name: string;
  price: number;
  image?: string | null;
}

interface ProductImageData {
  url: string;
  alt?: string | null;
}

export interface StudioProductData {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  images: ProductImageData[];
  variants: VariantData[];
  addOns: AddOnData[];
  categoryName?: string;
  categorySlug?: string;
}

interface CustomizationStudioProps {
  product: StudioProductData;
}

const STEPS = [
  { number: 1, label: "Select the Size of the Bouquet" },
  { number: 2, label: "Decide which add ons to include" },
  { number: 3, label: "Write the Message Card" },
  { number: 4, label: "Review the Order" },
] as const;

/**
 * CustomizationStudio — main client component for the customization wizard.
 *
 * Two-panel layout on desktop (options left, sticky summary right).
 * Single-column on mobile with sticky bottom summary bar.
 * Step wizard with progress indicator, back/next navigation.
 */
export default function CustomizationStudio({ product }: CustomizationStudioProps) {
  const { setProduct, selectedVariantId, setVariant } = useCustomizationStore();
  const [currentStep, setCurrentStep] = useState(1);
  const selectedAddOnIds = useCustomizationStore((s) => s.selectedAddOnIds);

  const messageAddOn = product.addOns.find((addOn) =>
    /message\s*card|greeting\s*card/i.test(addOn.name)
  );

  const shouldShowMessageStep = !!(
    messageAddOn && selectedAddOnIds.includes(messageAddOn.id)
  );

  const hasVariants = product.variants.length > 0;
  const hasVariantSelected = !hasVariants || selectedVariantId !== null;

  const isLastStep = currentStep === 4;

  // Initialize store with product ID when product changes
  useEffect(() => {
    setProduct(product.id);
  }, [product.id, setProduct]);

  // Auto-select first variant once, only when none is selected
  useEffect(() => {
    if (hasVariants && !selectedVariantId && product.variants.length > 0) {
      setVariant(product.variants[0].id);
    }
  }, [hasVariants, selectedVariantId, setVariant, product.variants]);

  useEffect(() => {
    if (currentStep === 3 && !shouldShowMessageStep) {
      setCurrentStep(4);
    }
  }, [currentStep, shouldShowMessageStep]);

  const canGoNext = () => {
    if (currentStep === 1) return hasVariantSelected;
    // Step 2 always allowed; Step 3 is conditional via shouldShowMessageStep
    return true;
  };

  const handleNext = () => {
    setCurrentStep((s) => {
      if (s < STEPS.length) {
        // If currently at Step 2 and user has no add-ons, skip Message Card (Step 3) to go to Order Summary (Step 4)
        if (s === 2 && !shouldShowMessageStep) return 4;

        // Otherwise normal increment
        const next = s + 1;

        // If we somehow are on Step 3 but shouldShowMessageStep is false, skip to Step 4
        if (next === 3 && !shouldShowMessageStep) return 4;

        return Math.min(next, STEPS.length);
      }
      return s;
    });
  };

  const handleBack = () => {
    setCurrentStep((s) => {
      if (s > 1) {
        // If currently at Order Summary (Step 4) and we're skipping Message Card, back should go to Step 2
        if (s === 4 && !shouldShowMessageStep) return 2;

        return s - 1;
      }
      return s;
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-0">
      {/* Step Wizard Progress Indicator */}
      <nav aria-label="Customization steps" className="w-full">
        <ol className="flex items-center gap-0">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isLast = index === STEPS.length - 1;

            return (
              <li key={step.number} className="flex items-center flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Step circle */}
                  <div
                    className={[
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      "text-sm font-semibold",
                      "transition-all duration-200",
                      isCompleted
                        ? "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]"
                        : isCurrent
                          ? "bg-[var(--accent-secondary)] text-white ring-2 ring-[var(--accent-primary)]"
                          : "bg-[var(--border-default)] text-[var(--text-muted)]",
                    ].join(" ")}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>

                  {/* Step label (mobile: hidden, desktop: visible) */}
                  <span
                    className={[
                      "hidden sm:inline text-sm font-medium truncate",
                      isCompleted || isCurrent
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)]",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={[
                      "flex-1 h-0.5 mx-3",
                      isCompleted
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
      </nav>

      {/* Main layout: left options + right summary (desktop) */}
      <div className="flex flex-col gap-8 lg:gap-12">
        {/* Left panel: scrollable options */}
        <div className="flex-1 flex flex-col gap-8 min-w-0 lg:max-w-3xl lg:mx-auto w-full">
          {/* Step 1: Size & Color */}
          {currentStep === 1 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-xl text-[var(--text-primary)]">
                Choose Size
              </h2>
              <SizeSelector
                variants={product.variants}
                basePrice={product.basePrice}
              />
            </section>
          )}

          {/* Step 2: Add-Ons */}
          {currentStep === 2 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-xl text-[var(--text-primary)]">
                Add Extras
              </h2>
              <AddOnToggleCards addOns={product.addOns} />
            </section>
          )}

          {/* Step 3: Message Card */}
          {currentStep === 3 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-xl text-[var(--text-primary)]">
                {shouldShowMessageStep ? "Add a Personal Message" : "Optional Message Card"}
              </h2>
              {shouldShowMessageStep ? (
                <MessageCardInput />
              ) : (
                <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-muted)]">
                  Add the greeting card add-on to include a personal note, or continue to review your bouquet.
                </div>
              )}
            </section>
          )}

          {/* Step 4: Order Summary */}
          {currentStep === 4 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-xl text-[var(--text-primary)]">
                Order Summary
              </h2>
              <div className="text-sm text-[var(--text-muted)]">
                Review your selections below.
              </div>
              <div className="flex justify-center pt-2">
                <div className="w-full max-w-md">
                  <CustomizationSummary
                    productId={product.id}
                    productName={product.name}
                    basePrice={product.basePrice}
                    variants={product.variants}
                    addOns={product.addOns}
                    images={product.images}
                    hasVariants={hasVariants}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Back/Next navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={[
                "flex items-center gap-1.5 px-4 py-2 rounded-[12px]",
                "text-sm font-medium",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                "cursor-pointer",
                currentStep === 1
                  ? "opacity-30 cursor-not-allowed text-[var(--text-muted)]"
                  : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
              ].join(" ")}
              aria-label="Previous step"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext()}
                className={[
                  "flex items-center gap-1.5 px-6 py-2 rounded-[12px]",
                  "text-sm font-semibold",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                  "cursor-pointer",
                  canGoNext()
                    ? "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)] hover:bg-[var(--accent-primary-hover)]"
                    : "opacity-40 cursor-not-allowed bg-[var(--border-default)] text-[var(--text-muted)]",
                ].join(" ")}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <span className="text-xs text-[var(--text-muted)]">
                Ready to add to cart &rarr;
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}