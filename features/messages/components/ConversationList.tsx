"use client";

import { useMemo } from "react";
import { useMessageStore } from "@/features/order/store/message-store";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@/features/messages/hooks/useConversations";

// ── Helpers ───────────────────────────────────────────

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
  });
}

// ── Props ──────────────────────────────────────────────

interface ConversationListProps {
  conversations: Conversation[];
  selectedOrderId: string | null;
  onSelect: (orderId: string) => void;
  isLoading: boolean;
}

// ── Skeleton ───────────────────────────────────────────

function ConversationListSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-[12px] p-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────

function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
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
      <p className="mt-1 text-xs text-[var(--text-muted)] max-w-[280px]">
        When you place an order and message the seller, your conversations will appear here
      </p>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────

const STATUS_BADGE_COLORS: Record<string, string> = {
  PENDING:
    "bg-[var(--state-warning)]/10 text-[var(--state-warning)] border-[var(--state-warning)]/20",
  CONFIRMED:
    "bg-[var(--accent-primary)]/10 text-[var(--accent-primary-foreground)] border-[var(--accent-primary)]/20",
  PREPARING:
    "bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary-foreground)] border-[var(--accent-secondary)]/20",
  OUT_FOR_DELIVERY:
    "bg-orange-500/10 text-orange-700 border-orange-500/20",
  DELIVERED:
    "bg-[var(--state-success)]/10 text-[var(--state-success)] border-[var(--state-success)]/20",
  CANCELLED:
    "bg-[var(--state-error)]/10 text-[var(--state-error)] border-[var(--state-error)]/20",
};

function StatusBadge({ status }: { status: string }) {
  const colors =
    STATUS_BADGE_COLORS[status] ?? STATUS_BADGE_COLORS.PENDING;
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium shrink-0",
        colors,
      ].join(" ")}
    >
      {status.replace("_", " ")}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────

/**
 * ConversationList — left sidebar showing order conversations.
 *
 * Each row: order number, status badge, last message preview (60 chars),
 * relative timestamp, unread badge from Zustand store.
 * Sorted server-side by most recent message. Unread conversations
 * surface to top within the list on client.
 */
export default function ConversationList({
  conversations,
  selectedOrderId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  const unreadByOrder = useMessageStore((s) => s.unreadByOrder);

  // Sort: unread first, then preserve server order (most recent first)
  const sorted = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aUnread = unreadByOrder[a.orderId] ?? 0;
      const bUnread = unreadByOrder[b.orderId] ?? 0;
      if (aUnread > 0 && bUnread === 0) return -1;
      if (bUnread > 0 && aUnread === 0) return 1;
      return 0; // preserve server sort
    });
  }, [conversations, unreadByOrder]);

  if (isLoading) return <ConversationListSkeleton />;

  if (conversations.length === 0) {
    return <EmptyConversations />;
  }

  return (
    <div className="flex flex-col gap-0.5 p-2" role="listbox" aria-label="Conversations">
      {sorted.map((conv) => {
        const unread = unreadByOrder[conv.orderId] ?? 0;
        const isSelected = conv.orderId === selectedOrderId;

        return (
          <div
            key={conv.orderId}
            role="option"
            tabIndex={0}
            aria-selected={isSelected}
            aria-current={isSelected ? "true" : undefined}
            aria-label={`${conv.itemLabel}${unread > 0 ? `, ${unread} unread messages` : ""}`}
            onClick={() => onSelect(conv.orderId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(conv.orderId);
              }
            }}
            className={[
              "flex items-start gap-3 rounded-[12px] p-3 transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
              isSelected
                ? "bg-[var(--accent-primary)]/10"
                : "hover:bg-[var(--bg-elevated)]",
            ].join(" ")}
          >
            {/* Avatar circle — first letter of item label */}
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold select-none",
                isSelected
                  ? "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
              ].join(" ")}
              aria-hidden="true"
            >
              {conv.itemLabel.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {conv.itemLabel}
                </span>
                <StatusBadge status={conv.orderStatus} />
              </div>
              {conv.lastMessage && (
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {conv.lastMessage.text}
                </p>
              )}
              <div className="flex items-center gap-2">
                {conv.lastMessage && (
                  <span className="text-[11px] text-[var(--text-muted)]/80">
                    {relativeTime(conv.lastMessage.createdAt)}
                  </span>
                )}
                {/* Unread badge */}
                {unread > 0 && (
                  <span
                    className={[
                      "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
                    ].join(" ")}
                    aria-label={`${unread} unread messages`}
                  >
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}