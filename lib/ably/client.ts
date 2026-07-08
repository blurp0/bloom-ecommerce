import { Realtime } from "ably";

/**
 * Module-level singleton Ably Realtime client.
 * Configured with authUrl so it calls /api/ably/token on first connect.
 * Created once at module load; never re-instantiated inside hooks or components.
 */
let _ablyClient: Realtime | null = null;

/**
 * Returns the shared Ably Realtime client instance.
 * Safe to call multiple times — always returns the same object.
 */
export function getAblyClient(): Realtime {
  if (!_ablyClient) {
    _ablyClient = new Realtime({
      authUrl: "/api/ably/token",
    });
  }
  return _ablyClient;
}
