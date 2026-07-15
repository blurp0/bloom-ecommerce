"use client";

import { create } from "zustand";
import type {
  CheckoutAddress,
  CheckoutStep,
  CheckoutState,
  CheckoutActions,
  CheckoutStore,
  TimeSlot,
  PaymentMethod,
} from "../types";

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