"use client";

import { useCheckoutStore, type CheckoutStep } from "../store/checkout-store";
import StepIndicator from "./StepIndicator";
import AddressStep from "./AddressStep";
import DeliveryStep from "./DeliveryStep";
import PaymentStep from "./PaymentStep";
import ReviewStep from "./ReviewStep";
import { useRouter } from "next/navigation";

/**
 * CheckoutShell — orchestrates the 4-step checkout flow.
 *
 * Renders the step indicator at top and the active step component below.
 * Step state persists in Zustand — navigating back does not clear values.
 * Step navigation is linear: forward only if current step is valid,
 * can always go back.
 */
export default function CheckoutShell() {
  const router = useRouter();
  const step = useCheckoutStore((s) => s.step);
  const setStep = useCheckoutStore((s) => s.setStep);

  const handleBack = () => {
    if (step === 1) {
      // Back on step 1 goes to /cart
      router.push("/cart");
      return;
    }
    setStep((step - 1) as CheckoutStep);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as CheckoutStep);
    }
  };

  const handleStepClick = (targetStep: CheckoutStep) => {
    // Only allow jumping to completed steps (behind current)
    if (targetStep < step) {
      setStep(targetStep);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Step indicator */}
      <StepIndicator currentStep={step} onStepClick={handleStepClick} />

      {/* Active step */}
      <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 md:p-8 shadow-clay-md">
        {step === 1 && <AddressStep onNext={handleNext} onBack={handleBack} />}
        {step === 2 && <DeliveryStep onNext={handleNext} onBack={handleBack} />}
        {step === 3 && <PaymentStep onNext={handleNext} onBack={handleBack} />}
        {step === 4 && <ReviewStep onBack={handleBack} />}
      </div>
    </div>
  );
}