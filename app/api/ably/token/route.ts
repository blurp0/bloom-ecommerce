import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ablyServer } from "@/lib/ably/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/ably/token
 *
 * Returns an Ably token request for authenticated users.
 * Uses Ably-recommended "token auth" pattern — the client never sees the API key.
 *
 * - 429 if the per-IP rate limit (20 req / 60 s) is exceeded.
 * - 401 if no Clerk session.
 * - 200 JSON token request object (keyName, timestamp, nonce, mac) if authenticated.
 */
export async function GET(request: NextRequest) {
  // 0. Rate limit — 20 requests per 60 s per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`ably/token:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    const retryAfterSeconds = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  // 1. Require an authenticated Clerk session
  const session = await auth();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = session;

  // 2. Create an Ably token request scoped to this user
  try {
    const tokenRequest = await ablyServer.auth.createTokenRequest({
      clientId: userId,
    });

    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("[ably/token] Failed to create token request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
