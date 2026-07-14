"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  OrderListItem,
  OrderDetailData,
  OrdersResponse,
  OrderDetailResponse,
} from "../types";

// Re-export types for consumers that import from hooks (backward compat)
export type { OrderListItem, OrderDetailData, OrdersResponse, OrderDetailResponse } from "../types";

/**
 * Fetch the authenticated user's orders list.
 * Stale time 30s — list doesn't need to be perfectly fresh.
 * Accepts an optional page parameter for pagination.
 */
export function useOrders(page: number = 1) {
  return useQuery<OrdersResponse>({
    queryKey: ["orders", page],
    queryFn: async () => {
      const res = await fetch(`/api/orders?page=${page}`);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch a single order by ID.
 * Stale time 0 — detail view should always be fresh.
 */
export function useOrder(id: string) {
  return useQuery<OrderDetailResponse>({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch order");
      }
      return res.json();
    },
    staleTime: 0,
    enabled: id !== "" && id != null,
  });
}