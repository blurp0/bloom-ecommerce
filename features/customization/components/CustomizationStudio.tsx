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
  { number: 1, label: "Size & Color" },
  { number: 2, label: "Add-Ons" },
  { number: 3, label: "Message Card" },
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

  const hasVariants = product.variants.length > 0;
  const hasVariantSelected = !hasVariants || selectedVariantId !== null;

  // Initialize store with product ID on mount
  useEffect(() => {
    setProduct(product.id);

    // Auto-select first variant if none selected and variants exist
    if (hasVariants && !selectedVariantId && product.variants.length > 0) {
      setVariant(product.variants[0].id);
    }
  }, [product.id, hasVariants, selectedVariantId, setProduct, setVariant, product.variants]);

  const canGoNext = () => {
    if (currentStep === 1) return hasVariantSelected;
    return true; // Steps 2 and 3 are optional
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
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
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left panel: scrollable options */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* Step 1: Size & Color */}
          {currentStep === 1 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-xl text-[var(--text-primary)]">
                Choose Size & Color
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
                Add a Personal Message
              </h2>
              <MessageCardInput />
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

        {/* Right panel: sticky summary (desktop only, hidden on mobile) */}
        <div className="hidden lg:block flex-shrink-0">
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

      {/* Mobile summary bar (visible only on mobile) */}
      <div className="lg:hidden">
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
  );
}