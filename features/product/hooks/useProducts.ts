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
 * Builds a query string from params, omitting undefined/empty values.
 */
function buildQueryString(params: ProductsParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
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
    queryFn: async () => {
      const url = `/api/products?${queryString}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      const json = await res.json();
      return json.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000, // 30 seconds before considered stale
  });
}