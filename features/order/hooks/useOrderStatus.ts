"use client";

import { useEffect, useState, useCallback } from "react";
import { getAblyClient } from "@/lib/ably/client";
import type { messageCallback, InboundMessage } from "ably";

/**
 * Subscribe to real-time order status updates via Ably.
 *
 * Listens on channel `order:{orderId}` for `status-updated` events.
 * Returns the current status, starting from `initialStatus` and
 * updating live as events arrive.
 *
 * Unsubscribes on unmount to prevent memory leaks.
 */
export function useOrderStatus(
  orderId: string,
  initialStatus: string
): { status: string } {
  const [status, setStatus] = useState<string>(initialStatus);

  const handleEvent: messageCallback<InboundMessage> = useCallback(
    (message) => {
      if (message.name === "status-updated") {
        const payload = message.data as { status: string };
        if (payload?.status) {
          setStatus(payload.status);
        }
      }
    },
    []
  );

  useEffect(() => {
    const ably = getAblyClient();
    const channel = ably.channels.get(`order:${orderId}`);

    channel.subscribe(handleEvent);

    return () => {
      channel.unsubscribe(handleEvent);
    };
  }, [orderId, handleEvent]);

  return { status };
}