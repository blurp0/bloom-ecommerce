/**
 * Product filtering and search utilities
 * Business logic for product queries
 */

import type { ProductFilterParams } from "../types";

/**
 * Builds a normalized, stable query string from filter params.
 * Keys are sorted alphabetically to prevent spurious cache misses.
 */
export function buildProductQueryString(params: ProductFilterParams): string {
  const searchParams = new URLSearchParams();

  // Sort keys for stable, order-independent cache key
  const entries = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => [key, String(value)]) as [string, string][];

  for (const [key, value] of entries.sort(([a], [b]) => a.localeCompare(b))) {
    searchParams.set(key, value);
  }

  return searchParams.toString();
}

/**
 * Extracts filter params from URL search params
 */
export function parseProductFilters(searchParams: URLSearchParams): ProductFilterParams {
  return {
    category: searchParams.get("category") || undefined,
    occasion: searchParams.get("occasion") || undefined,
    featured: searchParams.get("featured") === "true" ? true : undefined,
    minPrice: searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined,
    search: searchParams.get("search") || undefined,
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 12,
    sort: (searchParams.get("sort") as any) || "newest",
  };
}

/**
 * Validates and sanitizes filter params
 */
export function validateProductFilters(params: ProductFilterParams): ProductFilterParams {
  return {
    ...params,
    page: Math.max(1, params.page ?? 1),
    limit: Math.min(100, Math.max(1, params.limit ?? 12)),
    minPrice: params.minPrice ?? 0,
    maxPrice: params.maxPrice ?? Infinity,
  };
}
