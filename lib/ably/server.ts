import { Rest } from "ably";
import { env } from "@/lib/env";

/**
 * Server-side Ably REST client.
 * Used only in server contexts (API routes, server actions).
 * Never expose this instance or the API key to the client.
 */
export const ablyServer = new Rest(env.ABLY_API_KEY);
