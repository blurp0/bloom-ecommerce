/**
 * Product formatting utilities
 * Display helpers and configuration
 */

/**
 * Formats a number as PHP currency string.
 * Uses Intl.NumberFormat for correct locale-aware formatting.
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
 * Formats a product URL slug into a display name
 * Example: "crochet-bouquet" → "Crochet Bouquet"
 */
export function formatSlugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Truncates a description to a specified length with ellipsis
 */
export function truncateDescription(description: string, maxLength: number = 100): string {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength).trim() + "…";
}

/**
 * Product sort options for UI dropdowns
 */
export const productSortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Highest Rated" },
] as const;

/**
 * Price range presets for filtering
 */
export const priceRangePresets = [
  { label: "Under ₱500", min: 0, max: 500 },
  { label: "₱500 - ₱1000", min: 500, max: 1000 },
  { label: "₱1000 - ₱2000", min: 1000, max: 2000 },
  { label: "Over ₱2000", min: 2000, max: Infinity },
] as const;
