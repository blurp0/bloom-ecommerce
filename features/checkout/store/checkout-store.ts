"use client";

import { create } from "zustand";

/**
 * Address shape for the checkout flow.
 */
export interface CheckoutAddress {
  fullName: string;
  phone: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
}

/**
 * Time slot options for delivery scheduling.
 */
export type TimeSlot = "MORNING" | "AFTERNOON" | "EVENING";

/**
 * Payment method options (no built-in processing).
 */
export type PaymentMethod = "COD" | "EWALLET" | "MANUAL";

/**
 * Checkout flow step indices (1-indexed for display).
 */
export type CheckoutStep = 1 | 2 | 3 | 4;

/**
 * Checkout UI state — session-only, persisted in Zustand memory.
 * Not written to the database until step 4 (order creation).
 */
export interface CheckoutState {
  /** Current step index (1–4) */
  step: CheckoutStep;
  /** Delivery address information */
  address: CheckoutAddress;
  /** Preferred delivery date (ISO string, YYYY-MM-DD) */
  deliveryDate: string;
  /** Preferred time slot */
  timeSlot: TimeSlot | null;
  /** Selected payment method */
  paymentMethod: PaymentMethod | null;
  /** Whether an order submission is in flight */
  isSubmitting: boolean;
}

export interface CheckoutActions {
  /** Navigate to a specific step */
  setStep: (step: CheckoutStep) => void;
  /** Update one or more address fields */
  setAddress: (partial: Partial<CheckoutAddress>) => void;
  /** Set the preferred delivery date */
  setDeliveryDate: (date: string) => void;
  /** Set the preferred time slot */
  setTimeSlot: (slot: TimeSlot | null) => void;
  /** Set the payment method */
  setPaymentMethod: (method: PaymentMethod | null) => void;
  /** Set submitting state */
  setSubmitting: (submitting: boolean) => void;
  /** Reset the entire store to initial values */
  reset: () => void;
}

export type CheckoutStore = CheckoutState & CheckoutActions;

const initialAddress: CheckoutAddress = {
  fullName: "",
  phone: "",
  street: "",
  barangay: "",
  city: "",
  province: "",
  zipCode: "",
};

const initialState: CheckoutState = {
  step: 1,
  address: { ...initialAddress },
  deliveryDate: "",
  timeSlot: null,
  paymentMethod: null,
  isSubmitting: false,
};

/**
 * Zustand store for checkout UI state.
 *
 * Holds all checkout form data in memory as the user progresses through
 * the 4 steps (Address → Delivery → Payment → Review). Navigating back
 * does not clear previously entered values.
 *
 * This is session-only UI state — it is NOT persisted to the database
 * until the user completes step 4 (order creation).
 */
export const useCheckoutStore = create<CheckoutStore>((set) => ({
  ...initialState,

  setStep: (step: CheckoutStep) => set({ step }),

  setAddress: (partial: Partial<CheckoutAddress>) =>
    set((state) => ({
      address: { ...state.address, ...partial },
    })),

  setDeliveryDate: (date: string) => set({ deliveryDate: date }),

  setTimeSlot: (slot: TimeSlot | null) => set({ timeSlot: slot }),

  setPaymentMethod: (method: PaymentMethod | null) =>
    set({ paymentMethod: method }),

  setSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

  reset: () => set({ ...initialState, address: { ...initialAddress } }),
}));