"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema, type AddressData } from "@/lib/validators/address";
import { useCheckoutStore } from "../store/checkout-store";
import { useAddresses, useCreateAddress } from "../hooks/useAddresses";
import type { AddressResponse } from "@/lib/validators/address";

interface AddressStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 1: Delivery Address.
 *
 * Shows saved addresses as selectable cards when available, with a
 * "Use a different address" link that reveals the new-address form.
 * Runs service-area validation on city+province blur. On "Next",
 * new addresses are saved to the user's account and the Zustand store
 * is updated.
 */
export default function AddressStep({ onNext, onBack }: AddressStepProps) {
  const address = useCheckoutStore((s) => s.address);
  const setAddress = useCheckoutStore((s) => s.setAddress);

  const { data: savedAddresses, isLoading: addressesLoading } = useAddresses();
  const createAddressMutation = useCreateAddress();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    address.addressId ?? null
  );
  const [showNewForm, setShowNewForm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressData>({
    resolver: zodResolver(AddressSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      recipientName: address.fullName,
      phone: address.phone,
      street: address.street,
      barangay: address.barangay,
      city: address.city,
      province: address.province,
      zipCode: address.zipCode,
    },
  });

  /** Select a saved address card. */
  const handleSelectSaved = (addr: AddressResponse) => {
    setSelectedAddressId(addr.id);
    setShowNewForm(false);
    setAddress({
      addressId: addr.id,
      fullName: addr.recipientName,
      phone: addr.phone,
      street: addr.street,
      barangay: addr.barangay,
      city: addr.city,
      province: addr.province,
      zipCode: addr.zipCode,
    });
  };

  /** Switch to the new-address form. */
  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewForm(true);
  };

  /** Handle Next when a saved address is selected (no form submission needed). */
  const handleNextWithSaved = () => {
    if (!selectedAddressId || !savedAddresses) return;
    const addr = savedAddresses.find((a) => a.id === selectedAddressId);
    if (!addr) return;
    setAddress({
      addressId: addr.id,
      fullName: addr.recipientName,
      phone: addr.phone,
      street: addr.street,
      barangay: addr.barangay,
      city: addr.city,
      province: addr.province,
      zipCode: addr.zipCode,
    });
    onNext();
  };

  const onSubmit = async (data: AddressData) => {
    // Save the new address via API
    try {
      const created = await createAddressMutation.mutateAsync({
        recipientName: data.recipientName,
        phone: data.phone,
        street: data.street,
        barangay: data.barangay,
        city: data.city,
        province: data.province,
        zipCode: data.zipCode,
      });

      setAddress({
        addressId: created.id,
        fullName: data.recipientName,
        phone: data.phone,
        street: data.street,
        barangay: data.barangay,
        city: data.city,
        province: data.province,
        zipCode: data.zipCode,
      });

      onNext();
    } catch {
      setSaveError("Couldn't save your address — please try again");
    }
  };

  const isBusy = isSubmitting || createAddressMutation.isPending;
  const isNewFormVisible = showNewForm || (!addressesLoading && !savedAddresses?.length);
  const canProceed = isNewFormVisible || !!selectedAddressId;

  return (
    <form
      onSubmit={isNewFormVisible ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); handleNextWithSaved(); }}
      noValidate
      className="flex flex-col gap-6"
    >
      <div>
        <h2 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Delivery Address
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Where should we deliver your bouquet?
        </p>
      </div>

      {/* Saved addresses */}
      {savedAddresses && savedAddresses.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">
            Saved Addresses
          </p>
          <div className="flex flex-col gap-2">
            {savedAddresses.map((addr) => (
              <button
                type="button"
                key={addr.id}
                onClick={() => handleSelectSaved(addr)}
                className={[
                  "w-full rounded-[16px] border-2 p-4 text-left cursor-pointer",
                  "transition-all duration-200 ease-out",
                  "hover:bg-[var(--bg-elevated)]",
                  selectedAddressId === addr.id
                    ? "border-[var(--accent-primary)] bg-[var(--bg-elevated)]"
                    : "border-[var(--border-default)] bg-[var(--bg-surface)]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    {addr.label && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-secondary)]">
                        {addr.label}
                      </span>
                    )}
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {addr.recipientName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {addr.street}, {addr.barangay}, {addr.city}, {addr.province} {addr.zipCode}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{addr.phone}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {!showNewForm && (
            <button
              type="button"
              onClick={handleUseNewAddress}
              className={[
                "mt-2 w-full rounded-[12px] border-2 border-dashed p-3 text-sm",
                "border-[var(--border-default)] text-[var(--text-muted)]",
                "hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]",
                "transition-all duration-200 cursor-pointer",
              ].join(" ")}
            >
              + Add a new address
            </button>
          )}
        </div>
      )}

      {addressesLoading && (
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent-primary)]" />
          Loading saved addresses...
        </div>
      )}

      {/* New address form — shown when user clicks "Add" or no saved addresses exist */}
      {!addressesLoading && isNewFormVisible && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recipient Name */}
          <div className="md:col-span-2">
            <label
              htmlFor="sa-recipientName"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Recipient Name
            </label>
            <input
              id="sa-recipientName"
              type="text"
              autoComplete="name"
              {...register("recipientName")}
              className={[
                "w-full rounded-[12px] border px-4 py-2.5 text-base text-[var(--text-primary)]",
                "bg-[var(--bg-surface)] placeholder:text-[var(--text-muted)]",
                "border-[var(--border-interactive)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                "transition-colors duration-200",
                errors.recipientName && "border-[var(--state-error)]",
              ].join(" ")}
              placeholder="Juan Dela Cruz"
            />
            {errors.recipientName && (
              <p className="mt-1 text-xs text-[var(--state-error)]" role="alert">
                {errors.recipientName.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="md:col-span-2">
            <label
              htmlFor="sa-phone"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Phone Number
            </label>
            <input
              id="sa-phone"
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
              htmlFor="sa-street"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Street Address
            </label>
            <input
              id="sa-street"
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
              htmlFor="sa-barangay"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Barangay
            </label>
            <input
              id="sa-barangay"
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
              htmlFor="sa-city"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              City / Municipality
            </label>
            <input
              id="sa-city"
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
              htmlFor="sa-province"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Province
            </label>
            <input
              id="sa-province"
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
              htmlFor="sa-zipCode"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              ZIP Code
            </label>
            <input
              id="sa-zipCode"
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
      )}

      {saveError && (
        <div className="rounded-[12px] border border-[var(--state-error)] bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-sm text-[var(--state-error)]">{saveError}</p>
        </div>
      )}

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
          disabled={isBusy || !canProceed}
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
          {isBusy ? "Saving..." : "Next"}
        </button>
      </div>
    </form>
  );
}