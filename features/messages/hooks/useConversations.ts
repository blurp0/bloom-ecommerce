"use client";

import { useQuery } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────

export interface Conversation {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  /** First product name(s) for display — "Rose Bouquet" or "Rose Bouquet & 2 more" */
  itemLabel: string;
  lastMessage: {
    text: string;
    senderRole: "CUSTOMER" | "SELLER";
    createdAt: string;
  } | null;
  messageCount: number;
}

interface ConversationsResponse {
  data: {
    conversations: Conversation[];
  };
}

interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ── Hook ──────────────────────────────────────────────

/**
 * TanStack Query hook for the conversations list.
 *
 * Fetches all orders that have messages for the authenticated user.
 * Customer: ownership-scoped. Seller: all orders with messages.
 * staleTime 30s — list changes slower than individual threads.
 */
export function useConversations(): UseConversationsReturn {
  const query = useQuery<ConversationsResponse>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/orders/conversations");
      if (!res.ok) {
        throw new Error("Failed to fetch conversations");
      }
      return res.json();
    },
    staleTime: 30_000,
  });

  return {
    conversations: query.data?.data.conversations ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}