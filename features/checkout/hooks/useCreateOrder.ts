"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface CreateOrderInput {
  addressId: string;
  deliveryDate: string;
  timeSlot: "MORNING" | "AFTERNOON" | "EVENING";
  paymentMethod: "COD" | "EWALLET" | "MANUAL";
  selectedItemIds: string[];
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  estimatedDelivery: string | null;
}

/**
 * TanStack Query mutation for POST /api/orders.
 *
 * On success: invalidates cart and orders query caches, then redirects
 * to the order confirmation page.
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error ?? "Something went wrong");
      }

      return json.data as CreateOrderResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong — please try again");
    },
  });
}