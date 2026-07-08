"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ProductCardProduct } from "../components/ProductCard";

export type ProductsResponse = {
  products: ProductCardProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
};

export type ProductsParams = Record<string, string | undefined>;

/**
 * Builds a normalized, stable query string from params.
 *
 * Keys are sorted alphabetically before appending to URLSearchParams so
 * identical filters always produce the same string regardless of the order
 * they were inserted — preventing spurious cache misses.
 * Undefined/empty values are omitted.
 */
function buildQueryString(params: ProductsParams): string {
  const searchParams = new URLSearchParams();
  // Sort keys for a stable, order-independent cache key.
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value !== undefined && value !== "") {
      searchParams.set(key, value);
    }
  }
  return searchParams.toString();
}

/**
 * useProducts — TanStack Query hook for fetching filtered product listings.
 *
 * Accepts a params object mirroring URL query params and refetches
 * automatically when params change (via the query key).
 *
 * Usage:
 *   const { data, isFetching, isLoading, error } = useProducts({ category: "crochet-bouquets", sort: "price_asc" });
 */
export function useProducts(params: ProductsParams = {}) {
  const queryString = buildQueryString(params);

  return useQuery<ProductsResponse>({
    queryKey: ["products", queryString],
    queryFn: async ({ signal }) => {
      const url = `/api/products?${queryString}`;
      // Wire the AbortSignal so stale requests are cancelled when the
      // queryKey changes rapidly (e.g. fast typing in the search box).
      const res = await fetch(url, { signal });
      if (!res.ok) {
        // Surface the server / Zod error message when available instead
        // of only exposing the HTTP status code.
        let detail = "";
        try {
          const body = await res.json();
          detail = body?.error ?? "";
        } catch {
          // JSON parse failure — ignore; status is already informative enough.
        }
        throw new Error(
          `Failed to fetch products: ${res.status}${detail ? ` — ${detail}` : ""}`
        );
      }
      const json = await res.json();
      return json.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000, // 30 seconds before considered stale
  });
}