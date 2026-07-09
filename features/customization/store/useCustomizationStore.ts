"use client";

import { create } from "zustand";

export const MESSAGE_CARD_MAX_CHARS = 200;
const QUANTITY_MAX = 999;

/**
 * Types for customization store actions and state.
 */
export interface CustomizationState {
  /** The product ID being customized, or null if not set */
  productId: string | null;
  /** The selected product variant ID, or null if none selected */
  selectedVariantId: string | null;
  /** Array of selected add-on IDs */
  selectedAddOnIds: string[];
  /** Message card text (capped at 200 characters) */
  messageCardText: string;
  /** Quantity to add to cart (minimum 1) */
  quantity: number;
}

interface VariantInput {
  id: string;
  priceAdjustment: number;
}

interface AddOnInput {
  id: string;
  price: number;
}

export interface CustomizationActions {
  /** Set the product being customized */
  setProduct: (productId: string) => void;
  /** Set the selected variant by ID */
  setVariant: (variantId: string | null) => void;
  /** Toggle an add-on by ID: adds if absent, removes if present */
  toggleAddOn: (addOnId: string) => void;
  /** Set the message card text. Silently truncates to 200 characters. */
  setMessageCardText: (text: string) => void;
  /** Set the quantity. Ignores values below 1. */
  setQuantity: (n: number) => void;
  /** Reset all fields to their initial values */
  reset: () => void;
}

export type CustomizationStore = CustomizationState & CustomizationActions;

const initialState: CustomizationState = {
  productId: null,
  selectedVariantId: null,
  selectedAddOnIds: [],
  messageCardText: "",
  quantity: 1,
};

/**
 * Zustand store for bouquet customization UI state.
 *
 * Holds all selections made in the customization studio (variant, add-ons,
 * message card text, quantity). Provides actions to mutate each field and
 * a pure `previewPrice` selector for deriving a running price total.
 *
 * This is session-only UI state — it does NOT persist to localStorage.
 * No API calls are made inside this store; data (basePrice, variants, addOns)
 * is passed in from the component layer.
 */
export const useCustomizationStore = create<CustomizationStore>((set) => ({
  ...initialState,

  setProduct: (productId: string) =>
    set((state) => {
      if (state.productId === productId) return state;
      return { ...initialState, productId };
    }),

  setVariant: (variantId: string | null) => set({ selectedVariantId: variantId }),

  toggleAddOn: (addOnId: string) =>
    set((state) => {
      const alreadySelected = state.selectedAddOnIds.includes(addOnId);
      return {
        selectedAddOnIds: alreadySelected
          ? state.selectedAddOnIds.filter((id) => id !== addOnId)
          : [...state.selectedAddOnIds, addOnId],
      };
    }),

  setMessageCardText: (text: string) =>
    set({ messageCardText: text.length > MESSAGE_CARD_MAX_CHARS ? text.slice(0, MESSAGE_CARD_MAX_CHARS) : text }),

  setQuantity: (n: number) => {
    if (!Number.isInteger(n) || n < 1 || n > QUANTITY_MAX) return;
    set({ quantity: n });
  },

  reset: () => set({ ...initialState }),
}));

/**
 * Pure selector function — derives a running price preview from the
 * current store selections without persisting the computed value.
 *
 * @param basePrice - The product's base price
 * @param variants - Array of variants with id and priceAdjustment
 * @param addOns - Array of add-ons with id and price
 * @returns The computed total price as a number
 */
export function previewPrice(
  basePrice: number,
  selectedVariantId: string | null,
  selectedAddOnIds: string[],
  variants: VariantInput[],
  addOns: AddOnInput[]
): number {
  let total = basePrice;

  if (selectedVariantId) {
    const matchedVariant = variants.find((v) => v.id === selectedVariantId);
    if (matchedVariant) {
      total += matchedVariant.priceAdjustment;
    }
  }

  for (const addOnId of selectedAddOnIds) {
    const matchedAddOn = addOns.find((a) => a.id === addOnId);
    if (matchedAddOn) {
      total += matchedAddOn.price;
    }
  }

  return total;
}