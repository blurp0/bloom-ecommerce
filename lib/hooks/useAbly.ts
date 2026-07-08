"use client";

import { useEffect, useState } from "react";
import { getAblyClient } from "@/lib/ably/client";

type AblyStatus = "connecting" | "connected" | "disconnected" | "failed";

/**
 * useAbly — client-side hook that returns the shared Ably client and its
 * current connection status.
 *
 * - Does NOT close the shared client on unmount (it's a module-level singleton).
 * - Does clean up the connection state listener on unmount.
 * - Must only be used in Client Components (`"use client"`).
 */
export function useAbly() {
  const client = getAblyClient();

  const [status, setStatus] = useState<AblyStatus>(() => {
    // Map the current Ably connection state to our status type
    const state = client.connection.state;
    return mapState(state);
  });

  useEffect(() => {
    function handleStateChange(stateChange: { current: string }) {
      setStatus(mapState(stateChange.current));
    }

    client.connection.on(handleStateChange);

    // Sync initial state in case it changed between render and effect mount
    setStatus(mapState(client.connection.state));

    return () => {
      // Only remove this specific listener; do NOT close the shared client
      client.connection.off(handleStateChange);
    };
  }, [client]);

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
