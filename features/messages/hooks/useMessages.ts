"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Message,
  FetchMessagesResponse,
  SendMessageResponse,
  UseMessagesReturn,
} from "@/features/messages/types";

// ── Fetch helper ──────────────────────────────────────

async function fetchMessages(
  orderId: string,
  page: number,
): Promise<FetchMessagesResponse> {
  const res = await fetch(
    `/api/orders/${orderId}/messages?page=${page}&limit=50`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }
  return res.json();
}

// ── Hook ──────────────────────────────────────────────

/**
 * TanStack Query hook for order messages.
 *
 * Fetches messages oldest-first with pagination ("Load Earlier" loads page N+1).
 * Send mutation POSTs text to the API. No optimistic update —
 * Ably real-time (`useMessageChannel`) adds the message to the UI instead.
 * StaleTime 0 — messages should always be fresh.
 */
export function useMessages(orderId: string): UseMessagesReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery<FetchMessagesResponse>({
    queryKey: ["messages", orderId, page],
    queryFn: () => fetchMessages(orderId, page),
    staleTime: 0,
    enabled: orderId !== "" && orderId != null,
  });

  const mutation = useMutation<Message, Error, string>({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body.error ?? "Failed to send message");
        (err as NodeJS.ErrnoException).code = String(res.status);
        throw err;
      }
      const body: SendMessageResponse = await res.json();
      return body.data;
    },
    onSuccess: () => {
      // Invalidate message query so the GET picks up the new message.
      // Ably handles real-time insertion; this keeps the GET cache honest.
      queryClient.invalidateQueries({ queryKey: ["messages", orderId] });

      // Invalidate conversations list — new message may create first conversation
      // or update most-recent timestamp for existing conversation.
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Flatten pages: earlier pages = older messages (top), later pages = newer (bottom).
  // We merge all cached page results oldest-first.
  const allMessages: Message[] = [];
  const cachedPages = queryClient.getQueriesData<FetchMessagesResponse>({
    queryKey: ["messages", orderId],
    exact: false,
    predicate: (q) =>
      Array.isArray(q.queryKey) &&
      q.queryKey[0] === "messages" &&
      q.queryKey[1] === orderId,
  });

  // Sort cached pages by page number ascending, then concat messages
  const sortedCached = cachedPages
    .filter(([, data]) => data != null)
    .map(([key, data]) => ({
      page: (key as [string, string, number])[2] ?? 1,
      data: data!,
    }))
    .sort((a, b) => a.page - b.page);

  for (const entry of sortedCached) {
    allMessages.push(...entry.data.data.messages);
  }

  return {
    messages: allMessages,
    isLoading: query.isLoading && page === 1, // Only loading on initial page fetch
    error: query.error as Error | null,
    page,
    hasMore: query.data?.data.pagination.hasMore ?? false,
    loadMore: () => setPage((p) => p + 1),
    sendMessage: async (text: string) => {
      return mutation.mutateAsync(text);
    },
    isSending: mutation.isPending,
    sendError: mutation.error as Error | null,
  };
}
