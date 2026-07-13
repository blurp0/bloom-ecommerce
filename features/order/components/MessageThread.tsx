"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useMessages, type Message } from "@/features/order/hooks/useMessages";
import { useMessageChannel } from "@/features/order/hooks/useMessageChannel";
import { Skeleton } from "@/components/ui/skeleton";

// ── Props ──────────────────────────────────────────────

interface MessageThreadProps {
  orderId: string;
  currentUserRole: "CUSTOMER" | "SELLER";
  currentUserId?: string;
  onMessageReceived?: (message: Message) => void;
}

// ── Helpers ────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1_000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function senderInitial(name: string): string {
  return name.length === 0 ? "?" : (name.charAt(0) ?? "?").toUpperCase();
}

// ── Skeleton ───────────────────────────────────────────

function MessageSkeleton() {
  // Alternating left/right rows matching message shape — 5 rows with deterministic widths
  const widths = [65, 55, 40, 70, 45]; // Fixed widths for each skeleton row

  return (
    <div className="flex flex-col gap-4 p-4" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => {
        const isLeft = i % 2 === 0;
        return (
          <div
            key={i}
            className={[
              "flex gap-2 max-w-[80%]",
              isLeft ? "self-start" : "self-end flex-row-reverse",
            ].join(" ")}
          >
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton
                className="h-4 rounded"
                style={{ width: `${widths[0]}%` }}
              />
              <Skeleton
                className="h-4 rounded"
                style={{ width: `${widths[1]}%` }}
              />
              <Skeleton
                className="h-4 rounded"
                style={{ width: `${widths[2]}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Message Row ────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const roleBadgeColors: Record<string, string> = {
    CUSTOMER:
      "bg-[var(--accent-primary)]/15 text-[var(--accent-primary-foreground)] border-[var(--accent-primary)]/30",
    SELLER:
      "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary-foreground)] border-[var(--accent-secondary)]/30",
  };

  return (
    <div
      className={[
        "flex gap-2 max-w-[80%]",
        isOwn ? "self-end flex-row-reverse" : "self-start",
      ].join(" ")}
    >
      {/* Avatar circle */}
      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold select-none",
          isOwn
            ? "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]"
            : "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
        ].join(" ")}
        aria-hidden="true"
      >
        {senderInitial(message.senderName)}
      </div>

      {/* Bubble */}
      <div className="flex flex-col gap-1">
        <div
          className={[
            "flex items-center gap-1.5",
            isOwn ? "flex-row-reverse" : "",
          ].join(" ")}
        >
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {message.senderName}
          </span>
          <span
            className={[
              "inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium",
              roleBadgeColors[message.senderRole] ??
                roleBadgeColors.CUSTOMER,
            ].join(" ")}
          >
            {message.senderRole === "SELLER" ? "Seller" : "Customer"}
          </span>
        </div>
        <div
          className={[
            "rounded-[12px] px-3 py-2 text-sm leading-relaxed",
            isOwn
              ? "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]"
              : "bg-[var(--bg-elevated)] text-[var(--text-primary)]",
          ].join(" ")}
        >
          {/* ponytail: plain-text only — no HTML/Markdown rendering. Safe by construction. */}
          <span>{message.text}</span>
        </div>
        <span
          className={[
            "text-[11px] text-[var(--text-muted)]",
            isOwn ? "text-right" : "text-left",
          ].join(" ")}
          title={new Date(message.createdAt).toLocaleString("en-PH")}
        >
          {relativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────

function EmptyMessages() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-elevated)] mb-3">
        <svg
          className="h-6 w-6 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.372 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)]">
        No Messages Yet
      </p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Send the first message below
      </p>
    </div>
  );
}

// ── Error State ────────────────────────────────────────

function MessageError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
      <AlertTriangle className="h-8 w-8 text-[var(--state-error)] mb-2" />
      <p className="text-sm font-medium text-[var(--text-primary)]">
        Failed to Load Messages
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={[
          "mt-3 inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-semibold",
          "bg-[var(--bg-surface)] border border-[var(--border-default)]",
          "text-[var(--accent-secondary)] hover:bg-[var(--bg-elevated)]",
          "transition-all duration-200 ease-out active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
        ].join(" ")}
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}

// ── Connection Error Banner ────────────────────────────

function ConnectionBanner({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-[8px] bg-[var(--state-warning)]/10 border border-[var(--state-warning)]/20 px-3 py-2 text-xs text-[var(--text-primary)]">
      <span>Messages are not updating in real time</span>
      <button
        type="button"
        onClick={onRefresh}
        className={[
          "shrink-0 rounded-[8px] px-2.5 py-1 text-[11px] font-semibold",
          "bg-[var(--state-warning)]/15 text-[var(--text-primary)]",
          "hover:bg-[var(--state-warning)]/25 transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
        ].join(" ")}
      >
        Refresh
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────

/**
 * MessageThread — displays paginated order messages with real-time updates.
 *
 * - Fetches messages via `useMessages` (TanStack Query, oldest-first).
 * - Subscribes to Ably `message-posted` events via `useMessageChannel`.
 * - New messages appear at bottom; "Load Earlier" fetches older pages at top.
 * - Plain-text only — renders via `<span>`, never `innerHTML`.
 */
export default function MessageThread({
  orderId,
  currentUserRole,
  currentUserId,
  onMessageReceived,
}: MessageThreadProps) {
  const {
    messages: serverMessages,
    isLoading,
    error,
    page,
    hasMore,
    loadMore,
  } = useMessages(orderId);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(serverMessages.length);

  const { liveMessages, hasConnectionError } = useMessageChannel({
    orderId,
    isThreadVisible: true,
  });

  // Merge server-fetched + live (Ably) messages, dedup by id
  const mergedMessages: Message[] = [...serverMessages];
  for (const live of liveMessages) {
    if (!mergedMessages.some((m) => m.id === live.messageId)) {
      mergedMessages.push({
        id: live.messageId,
        orderId,
        senderId: live.senderId,
        senderName: live.senderName,
        senderRole: live.senderRole as "CUSTOMER" | "SELLER",
        text: live.text,
        createdAt: live.createdAt,
      });
    }
  }

  // Scroll to bottom on initial load and when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [isLoading, serverMessages.length]);

  useEffect(() => {
    const prev = prevCountRef.current;
    const curr = mergedMessages.length;
    prevCountRef.current = curr;

    if (curr > prev && prev > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mergedMessages.length]);

  // Notify parent when a live message arrives
  useEffect(() => {
    if (liveMessages.length > 0 && onMessageReceived) {
      const latest = liveMessages[liveMessages.length - 1];
      const msg: Message = {
        id: latest.messageId,
        orderId,
        senderId: latest.senderId,
        senderName: latest.senderName,
        senderRole: latest.senderRole as "CUSTOMER" | "SELLER",
        text: latest.text,
        createdAt: latest.createdAt,
      };
      onMessageReceived(msg);
    }
    // ponytail: intentionally only run on liveMessages change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMessages.length]);

  const handleLoadEarlier = async () => {
    setIsLoadingMore(true);
    // TanStack Query will fetch next page; we brief-sleep to let UI catch up
    loadMore();
    // The query will auto-update. Brief delay to prevent flash.
    setTimeout(() => setIsLoadingMore(false), 300);
  };

  // ── Render ────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-transparent">
      {/* Connection error banner */}
      {hasConnectionError && (
        <ConnectionBanner
          onRefresh={() => window.location.reload()}
        />
      )}

      {/* Loading state */}
      {isLoading && <MessageSkeleton />}

      {/* Error state */}
      {!isLoading && error && !serverMessages.length && (
        <MessageError
          onRetry={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Messages */}
      {!isLoading && !error && (
        <div
          role="log"
          aria-live="polite"
          aria-label="Message thread"
          className="flex flex-col flex-1 overflow-y-auto pb-2"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* "Load Earlier" button */}
          {hasMore && (
            <div className="flex justify-center py-2">
              <button
                type="button"
                onClick={handleLoadEarlier}
                disabled={isLoadingMore}
                className={[
                  "rounded-[8px] px-4 py-1.5 text-xs font-semibold",
                  "text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)]",
                  "bg-transparent hover:bg-[var(--bg-elevated)]",
                  "transition-colors duration-150",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                ].join(" ")}
              >
                {isLoadingMore ? "Loading..." : "Load Earlier Messages"}
              </button>
            </div>
          )}

          {/* No messages */}
          {mergedMessages.length === 0 && !isLoading && <EmptyMessages />}

          {/* Message list */}
          <div className="flex flex-col gap-3 px-4 py-2">
            {mergedMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={
                  currentUserId
                    ? msg.senderId === currentUserId
                    : msg.senderRole === currentUserRole
                }
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}