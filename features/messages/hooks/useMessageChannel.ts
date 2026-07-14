"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAblyClient } from "@/lib/ably/client";
import { useMessageStore } from "@/features/messages/store/message-store";
import type { messageCallback, InboundMessage } from "ably";
import type {
  LiveMessage,
  ConnectionState,
  UseMessageChannelOptions,
  UseMessageChannelReturn,
} from "@/features/messages/types";

// ── Hook ──────────────────────────────────────────────

/**
 * Subscribe to `order:{orderId}` channel for `message-posted` events.
 *
 * Appends incoming messages to local state (newest appended at bottom).
 * Tracks unread counts via `useMessageStore` — increments when `isThreadVisible`
 * is false, clears on mount when thread is visible.
 *
 * Unsubscribes on unmount. Reconnection is handled by the Ably SDK.
 * Connection errors surface a flag (`hasConnectionError`) for a fallback banner.
 */
export function useMessageChannel({
  orderId,
  isThreadVisible,
}: UseMessageChannelOptions): UseMessageChannelReturn {
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("initialized");

  const clearUnread = useMessageStore((s) => s.clearUnread);
  const incrementUnread = useMessageStore((s) => s.incrementUnread);

  // Track whether we should suppress the unread-increment for the first
  // batch of messages that arrive on initial load (those were already fetched
  // via GET and should not count as "new").
  const initialBatch = useRef(true);

  // ── Clear unread when thread becomes visible ──────────
  useEffect(() => {
    if (isThreadVisible) {
      clearUnread(orderId);
    }
  }, [isThreadVisible, orderId, clearUnread]);

  // ── Ably subscription ─────────────────────────────────
  const handleMessage: messageCallback<InboundMessage> = useCallback(
    (message) => {
      if (message.name === "message-posted") {
        const payload = message.data as LiveMessage;

        setLiveMessages((prev) => {
          // Dedup: skip if we already have this messageId (from initial fetch or duplicate event)
          if (prev.some((m) => m.messageId === payload.messageId)) {
            return prev;
          }
          return [...prev, payload];
        });

        // Increment unread only after the initial batch window
        if (!initialBatch.current && !isThreadVisible) {
          incrementUnread(orderId);
        }
      }
    },
    [orderId, isThreadVisible, incrementUnread],
  );

  useEffect(() => {
    const ably = getAblyClient();
    const channel = ably.channels.get(`order:${orderId}`);

    // Track connection state for the error banner
    // ably.connection.on receives (ConnectionStateChange) — we use the .current string
    const onConnectionStateChange = (stateChange: { current: string }) => {
      setConnectionState(stateChange.current as ConnectionState);
    };
    ably.connection.on(onConnectionStateChange);

    channel.subscribe(handleMessage);

    // After a short settling window, start counting new messages as unread
    initialBatch.current = true;
    const timer = setTimeout(() => {
      initialBatch.current = false;
    }, 2000);

    return () => {
      clearTimeout(timer);
      channel.unsubscribe(handleMessage);
      ably.connection.off(onConnectionStateChange);
    };
  }, [orderId, handleMessage]);

  const hasConnectionError =
    connectionState === "suspended" || connectionState === "failed";

  return { liveMessages, hasConnectionError };
}
