"use client";

import { create } from "zustand";
import type {
  CustomizationState,
  VariantInput,
  AddOnInput,
  CustomizationStore,
} from "@/features/customization/types";

export const MESSAGE_CARD_MAX_CHARS = 200;
const QUANTITY_MAX = 999;

const initialState: CustomizationState = {
  productId: null,
  selectedVariantId: null,
  selectedColor: null,
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

  setColor: (color: string | null) => set({ selectedColor: color }),

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