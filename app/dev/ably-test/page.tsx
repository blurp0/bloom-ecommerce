"use client";

import { useAbly } from "@/lib/hooks/useAbly";

/**
 * /dev/ably-test
 *
 * Validates the Ably integration end-to-end:
 *  - Calls useAbly() to get the shared client + connection status.
 *  - Shows connection status in the browser.
 *  - After sign-in, status should progress from "connecting" → "connected".
 *
 * This page requires the user to be signed in via Clerk.
 * If not signed in the /api/ably/token route returns 401 and the
 * status will eventually show "failed" or "disconnected".
 */
export default function AblyTestPage() {
  const { status } = useAbly();

  const statusColors: Record<string, string> = {
    connected: "var(--color-success, #22c55e)",
    connecting: "var(--color-warning, #f59e0b)",
    disconnected: "var(--color-muted, #6b7280)",
    failed: "var(--color-destructive, #ef4444)",
  };

  const color = statusColors[status] ?? "#6b7280";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
        fontFamily: "var(--font-sans, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
        Ably Integration Test
      </h1>

      <div
        style={{
          border: "1px solid var(--border-default, #e5e7eb)",
          borderRadius: "0.75rem",
          padding: "2rem 3rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          background: "var(--surface-card, #fff)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Status indicator dot */}
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
            transition: "background 0.3s, box-shadow 0.3s",
          }}
        />

        <p style={{ fontSize: "1.125rem", fontWeight: 600 }}>
          status:{" "}
          <span style={{ color }}>
            &quot;{status}&quot;
          </span>
        </p>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted, #6b7280)",
            textAlign: "center",
            maxWidth: 320,
          }}
        >
          {status === "connected" &&
            "✅ Ably connected. Token auth is working correctly."}
          {status === "connecting" &&
            "⏳ Connecting to Ably… Make sure you are signed in."}
          {status === "disconnected" &&
            "⚠️ Disconnected. Sign in with Clerk and reload the page."}
          {status === "failed" &&
            "❌ Connection failed. Check ABLY_API_KEY in .env and Clerk session."}
        </p>
      </div>

      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted, #9ca3af)",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <strong>Check When Done:</strong> After signing in, the status above
        should read <em>&quot;connected&quot;</em>. The ABLY_API_KEY must not
        appear in any browser network response body.
      </p>
    </main>
  );
}
