"use client";

import { useQuery } from "@tanstack/react-query";

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  orderTotal: number;
  createdAt: string;
  itemCount: number;
}

export interface OrderItemDetail {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  customizations: Record<string, unknown>;
  unitPrice: number;
  itemTotal: number;
}

export interface StatusTimelineEntry {
  status: string;
  label: string;
  date: string | null;
}

export interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: string;
  orderTotal: number;
  deliveryAddress: string;
  deliveryDate: string;
  deliverySlot: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  hasReview: boolean;
  orderReviewText?: string;
  items: OrderItemDetail[];
  statusTimeline: StatusTimelineEntry[];
}

interface OrdersResponse {
  data: OrderListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

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
  return useQuery<{ data: OrderDetailData }>({
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