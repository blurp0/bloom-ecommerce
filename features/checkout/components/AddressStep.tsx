"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema, type AddressData } from "@/lib/validators/checkout";
import { useCheckoutStore } from "../store/checkout-store";

interface AddressStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 1: Delivery Address.
 *
 * Collects full name, phone, street, barangay, city, province, and ZIP code.
 * Uses React Hook Form + Zod for inline on-blur validation.
 * Writes valid values to the Zustand checkout store on "Next".
 */
export default function AddressStep({ onNext, onBack }: AddressStepProps) {
  const address = useCheckoutStore((s) => s.address);
  const setAddress = useCheckoutStore((s) => s.setAddress);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AddressData>({
    resolver: zodResolver(AddressSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: address,
  });

  const onSubmit = (data: AddressData) => {
    setAddress(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Delivery Address
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Where should we deliver your bouquet?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label
            htmlFor="address-fullName"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Full Name
          </label>
          <input
            id="address-fullName"
            type="text"
            autoComplete="name"
            {...register("fullName")}
            className={[
              "w-full rounded-[12px] border px-4 py-2.5 text-base text-[var(--text-primary)]",
              "bg-[var(--bg-surface)] placeholder:text-[var(--text-muted)]",
              "border-[var(--border-interactive)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "transition-colors duration-200",
              errors.fullName && "border-[var(--state-error)]",
            ].join(" ")}
            placeholder="Juan Dela Cruz"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="md:col-span-2">
          <label
            htmlFor="address-phone"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Phone Number
          </label>
          <input
            id="address-phone"
            type="tel"
            autoComplete="tel"
            {...register("phone")}
            className={[
              "w-full rounded-[12px] border px-4 py-2.5 text-base text-[var(--text-primary)]",
              "bg-[var(--bg-surface)] placeholder:text-[var(--text-muted)]",
              "border-[var(--border-interactive)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "transition-colors duration-200",
              errors.phone && "border-[var(--state-error)]",
            ].join(" ")}
            placeholder="09171234567"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Street */}
        <div className="md:col-span-2">
          <label
            htmlFor="address-street"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Street Address
          </label>
          <input
            id="address-street"
            type="text"
            autoComplete="street-address"
            {...register("street")}
            className={[
              "w-full rounded-[12px] border px-4 py-2.5 text-base text-[var(--text-primary)]",
              "bg-[var(--bg-surface)] placeholder:text-[var(--text-muted)]",
              "border-[var(--border-interactive)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "transition-colors duration-200",
              errors.street && "border-[var(--state-error)]",
            ].join(" ")}
            placeholder="123 Rizal St."
          />
          {errors.street && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.street.message}
            </p>
          )}
        </div>

        {/* Barangay */}
        <div>
          <label
            htmlFor="address-barangay"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Barangay
          </label>
          <input
            id="address-barangay"
            type="text"
            autoComplete="address-level4"
            {...register("barangay")}
            className={[
              "w-full rounded-[12px] border px-4 py-2.5 text-base text-[var(--text-primary)]",
              "bg-[var(--bg-surface)] placeholder:text-[var(--text-muted)]",
              "border-[var(--border-interactive)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "transition-colors duration-200",
              errors.barangay && "border-[var(--state-error)]",
            ].join(" ")}
            placeholder="Barangay San Isidro"
          />
          {errors.barangay && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.barangay.message}
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="address-city"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            City / Municipality
          </label>
          <input
            id="address-city"
            type="text"
            autoComplete="address-level2"
            {...register("city")}
            className={[
              "w-full rounded-[12px] border px-4 py-2.5 text-base text-[var(--text-primary)]",
              "bg-[var(--bg-surface)] placeholder:text-[var(--text-muted)]",
              "border-[var(--border-interactive)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "transition-colors duration-200",
              errors.city && "border-[var(--state-error)]",
            ].join(" ")}
            placeholder="Quezon City"
          />
          {errors.city && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.city.message}
            </p>
          )}
        </div>

        {/* Province */}
        <div>
          <label
            htmlFor="address-province"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Province
          </label>
          <input
            id="address-province"
            type="text"
            autoComplete="address-level1"
            {...register("province")}
            className={[
              "w-full rounded-[12px] border px-4 py-2.5 text-base text-[var(--text-primary)]",
              "bg-[var(--bg-surface)] placeholder:text-[var(--text-muted)]",
              "border-[var(--border-interactive)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "transition-colors duration-200",
              errors.province && "border-[var(--state-error)]",
            ].join(" ")}
            placeholder="Metro Manila"
          />
          {errors.province && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.province.message}
            </p>
          )}
        </div>

        {/* ZIP Code */}
        <div>
          <label
            htmlFor="address-zipCode"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            ZIP Code
          </label>
          <input
            id="address-zipCode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={4}
            {...register("zipCode")}
            className={[
              "w-full rounded-[12px] border px-4 py-2.5 text-base text-[var(--text-primary)]",
              "bg-[var(--bg-surface)] placeholder:text-[var(--text-muted)]",
              "border-[var(--border-interactive)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              "transition-colors duration-200",
              errors.zipCode && "border-[var(--state-error)]",
            ].join(" ")}
            placeholder="1100"
          />
          {errors.zipCode && (
            <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
              {errors.zipCode.message}
            </p>
          )}
        </div>
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
          Back to Cart
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