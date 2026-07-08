"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getAblyClient } from "@/lib/ably/client";

type AblyStatus = "connecting" | "connected" | "disconnected" | "failed";

/**
 * useAbly — client-side hook that returns the shared Ably client and its
 * current connection status.
 *
 * Uses useSyncExternalStore to subscribe to Ably's connection state directly,
 * avoiding any render-to-mount race that the previous useEffect+useState
 * approach had.
 *
 * - Does NOT close the shared client on unmount (it's a module-level singleton).
 * - Does clean up the connection state listener on unmount.
 * - Must only be used in Client Components (`"use client"`).
 */
export function useAbly() {
  const client = getAblyClient();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      client.connection.on(onStoreChange);
      return () => {
        // Only remove this specific listener; do NOT close the shared client
        client.connection.off(onStoreChange);
      };
    },
    [client]
  );

  const status = useSyncExternalStore(
    subscribe,
    // getSnapshot: called on every render (and after each store notification)
    // to derive the current value from the external store
    () => mapState(client.connection.state),
    // getServerSnapshot: SSR fallback — connection is always "connecting" server-side
    () => "connecting" as AblyStatus
  );

  return { client, status };
}

/** Maps Ably connection state strings to our typed AblyStatus enum. */
function mapState(state: string): AblyStatus {
  switch (state) {
    case "connected":
      return "connected";
    case "connecting":
    case "initialized":
      return "connecting";
    case "failed":
      return "failed";
    default:
      // covers: closed, closing, suspended, disconnected
      return "disconnected";
  }
}
