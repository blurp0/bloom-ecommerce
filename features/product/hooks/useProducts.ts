"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ProductsResponse, ProductFilterParams } from "../types";
import { buildProductQueryString } from "../utils/filtering";

/**
 * useProducts — TanStack Query hook for fetching filtered product listings.
 *
 * Accepts a params object with filtering, sorting, and pagination options
 * and refetches automatically when params change (via the query key).
 *
 * Usage:
 *   const { data, isFetching, isLoading, error } = useProducts({ category: "wedding", sort: "price_asc" });
 */
export function useProducts(params: ProductFilterParams = {}, options: { enabled?: boolean } = {}) {
  const queryString = buildProductQueryString(params);

  return useQuery<ProductsResponse>({
    queryKey: ["products", queryString],
    enabled: options.enabled !== false,
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