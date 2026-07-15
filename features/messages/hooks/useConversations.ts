"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  Conversation,
  ConversationsResponse,
  UseConversationsReturn,
} from "@/features/messages/types";

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
