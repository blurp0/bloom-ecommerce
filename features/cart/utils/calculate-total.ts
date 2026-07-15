import type { CartItemResult } from "../types";

export function calculateSubtotal(items: CartItemResult[]): number {
  return items.reduce((sum, item) => sum + item.itemTotal, 0);
}

export function calculateItemCount(items: CartItemResult[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateCartTotal(subtotal: number, deliveryFee = 0, taxRate = 0): number {
  return subtotal + deliveryFee + (subtotal * taxRate);
}
