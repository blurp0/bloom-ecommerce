"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

/**
 * Cart item shape returned by the API.
 */
export interface CartItemResult {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  customization: Record<string, unknown>;
  itemTotal: number;
}

export interface CartResult {
  id: string;
  items: CartItemResult[];
  subtotal: number;
  itemCount: number;
}

export interface AddCartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  customization?: {
    size?: string;
    color?: string;
    addOns?: string[];
    messageCard?: string;
  };
  customRequestId?: string;
}

const CART_QUERY_KEY = ["cart"] as const;

async function fetchCart(): Promise<CartResult> {
  const res = await fetch("/api/cart");
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to fetch cart");
  }
  const json = await res.json();
  return json.data as CartResult;
}

/**
 * Hook that returns the current user's cart.
 * staleTime: 0 ensures we always refetch on mount (cart changes frequently).
 * Only fetches when the user is authenticated to avoid 401 errors for guests.
 */
export function useCart() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    staleTime: 0,
    retry: 1,
    enabled: !!isSignedIn,
  });
}

/**
 * Mutation to add an item to the cart.
 * Performs an optimistic update: appends the item immediately, rolls back on error.
 */
export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddCartItemInput) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to add item");
      }
      const json = await res.json();
      return json.data as CartItemResult;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<CartResult>(CART_QUERY_KEY);

      // If we don't have the cart yet, skip optimistic update
      if (!previousCart) return { previousCart: undefined };

      // Build an optimistic item
      const optimisticItem: CartItemResult = {
        id: `optimistic-${Date.now()}`,
        productId: input.productId,
        productName: "Adding…",
        productImage: null,
        quantity: input.quantity,
        unitPrice: 0,
        customization: (input.customization ?? {}) as Record<string, unknown>,
        itemTotal: 0,
      };

      queryClient.setQueryData<CartResult>(CART_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: [...old.items, optimisticItem],
          itemCount: old.itemCount + input.quantity,
          subtotal: old.subtotal, // price unknown, keep old
        };
      });

      return { previousCart };
    },
    onError: (_err, _input, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

/**
 * Mutation to update a cart item's quantity.
 * Optimistic update: updates the quantity immediately, rolls back on error.
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to update item");
      }
      const json = await res.json();
      return json.data as CartItemResult;
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<CartResult>(CART_QUERY_KEY);

      if (!previousCart) return { previousCart: undefined };

      queryClient.setQueryData<CartResult>(CART_QUERY_KEY, (old) => {
        if (!old) return old;
        const items = old.items.map((item) => {
          if (item.id === itemId && !item.id.startsWith("optimistic-")) {
            const newItemTotal = item.unitPrice * quantity;
            return { ...item, quantity, itemTotal: newItemTotal };
          }
          return item;
        });
        const subtotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        return { ...old, items, subtotal, itemCount };
      });

      return { previousCart };
    },
    onError: (_err, _input, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

/**
 * Mutation to remove a cart item.
 * Optimistic update: removes the item immediately, rolls back on error.
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to remove item");
      }
      return true;
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<CartResult>(CART_QUERY_KEY);

      if (!previousCart) return { previousCart: undefined };

      queryClient.setQueryData<CartResult>(CART_QUERY_KEY, (old) => {
        if (!old) return old;
        const items = old.items.filter((item) => item.id !== itemId);
        const subtotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        return { ...old, items, subtotal, itemCount };
      });

      return { previousCart };
    },
    onError: (_err, _input, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}