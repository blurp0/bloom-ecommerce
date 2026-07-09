/**
 * Format a price in Philippine Peso (PHP).
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Compute the unit price for a customized product.
 *
 * @param basePrice - The product's base price
 * @param variantPrice - The selected variant's price adjustment, or null if no variant selected
 * @param addOnPrices - Array of prices for each selected add-on
 * @returns The total unit price, rounded to 2 decimal places
 */
export function computePrice(
  basePrice: number,
  variantPrice: number | null,
  addOnPrices: number[]
): number {
  const total = basePrice + (variantPrice ?? 0) + addOnPrices.reduce((sum, p) => sum + p, 0);
  return roundTo2(total);
}

/**
 * Compute the line total for a given quantity of items at a unit price.
 *
 * @param unitPrice - The unit price of a single item
 * @param quantity - The quantity (must be >= 1)
 * @returns The line total, rounded to 2 decimal places
 * @throws {Error} If quantity is less than 1
 */
export function computeLineTotal(unitPrice: number, quantity: number): number {
  if (quantity < 1) {
    throw new Error("quantity must be >= 1");
  }
  return roundTo2(unitPrice * quantity);
}

/**
 * Round a number to exactly 2 decimal places, avoiding floating-point drift.
 * Uses "round half up" (Math.round) which matches standard financial rounding.
 */
function roundTo2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}