"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ExternalLink, MessageSquare } from "lucide-react";
import { useConversations } from "@/features/messages/hooks/useConversations";
import ConversationList from "@/features/messages/components/ConversationList";
import MessageThread from "@/features/order/components/MessageThread";
import MessageInput from "@/features/order/components/MessageInput";

// ── Chat Room (right panel on desktop, full-width on mobile) ──

interface ChatRoomProps {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  onBack?: () => void; // mobile back arrow
}

function ChatRoom({ orderId, orderNumber, orderStatus, onBack }: ChatRoomProps) {
  const statusLabel = (s: string) =>
    s === "OUT_FOR_DELIVERY" ? "Out for Delivery" : s.charAt(0) + s.slice(1).toLowerCase();

  const statusBadgeColors: Record<string, string> = {
    PENDING: "bg-[var(--state-warning)]/10 text-[var(--state-warning)] border-[var(--state-warning)]/20",
    CONFIRMED: "bg-[var(--accent-primary)]/10 text-[var(--accent-primary-foreground)] border-[var(--accent-primary)]/20",
    PREPARING: "bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary-foreground)] border-[var(--accent-secondary)]/20",
    OUT_FOR_DELIVERY: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    DELIVERED: "bg-[var(--state-success)]/10 text-[var(--state-success)] border-[var(--state-success)]/20",
    CANCELLED: "bg-[var(--state-error)]/10 text-[var(--state-error)] border-[var(--state-error)]/20",
  };

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {/* Chat room header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)]">
        {/* Mobile back button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 md:hidden flex items-center justify-center h-9 w-9 rounded-[12px] hover:bg-[var(--bg-elevated)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5 text-[var(--text-primary)]" />
          </button>
        )}

        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-primary)] font-mono">
              {orderNumber}
            </span>
            <span
              className={[
                "inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium",
                statusBadgeColors[orderStatus] ?? statusBadgeColors.PENDING,
              ].join(" ")}
            >
              {statusLabel(orderStatus)}
            </span>
          </div>
        </div>

        <Link
          href={`/orders/${orderId}`}
          className={[
            "inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-semibold shrink-0",
            "text-[var(--accent-secondary)] hover:bg-[var(--bg-elevated)]",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
          ].join(" ")}
        >
          View Order
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Thread + Input */}
      <MessageThread orderId={orderId} currentUserRole="CUSTOMER" />
      <MessageInput orderId={orderId} currentUserRole="CUSTOMER" />
    </div>
  );
}

// ── No Selection Placeholder ────────────────────────────

function NoConversationSelected() {
  return (
    <div className="hidden md:flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
          <MessageSquare className="h-8 w-8 text-[var(--text-muted)]" />
        </div>
        <p className="text-sm font-medium text-[var(--text-muted)]">
          Select a conversation from the left to start chatting
        </p>
      </div>
    </div>
  );
}

// ── Main ChatHub ────────────────────────────────────────

/**
 * ChatHub — split-panel messaging hub.
 *
 * Desktop (≥768px): conversation list left (300px) + chat room right.
 * Mobile (<768px): full-width conversation list; tap opens chat room
 * with back arrow to return to list.
 *
 * Query param `?orderId=...` pre-selects a conversation (deep-link from
 * OrderDetail "Message Seller" button).
 */
export default function ChatHub() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { conversations, isLoading, refetch } = useConversations();

  const initialOrderId = searchParams.get("orderId") ?? null;

  // Validate deep-link: only select if orderId exists in conversations
  const validOrderId =
    initialOrderId &&
    conversations.some((c) => c.orderId === initialOrderId)
      ? initialOrderId
      : null;

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    validOrderId,
  );

  // Sync selectedOrderId with validated deep-link on data load — only apply once
  useEffect(() => {
    if (initialOrderId && conversations.some((c) => c.orderId === initialOrderId)) {
      setSelectedOrderId(initialOrderId);
    } else if (initialOrderId && conversations.length > 0 && !conversations.some((c) => c.orderId === initialOrderId)) {
      // Deep-linked orderId not in conversations — clear
      setSelectedOrderId(null);
    }
  }, [initialOrderId]); // Only track initialOrderId, not conversations

  const selectedConv = conversations.find(
    (c) => c.orderId === selectedOrderId,
  );

  const handleSelect = useCallback(
    (orderId: string) => {
      setSelectedOrderId(orderId);
    },
    [],
  );

  const handleBack = useCallback(() => {
    setSelectedOrderId(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/orders"
          className={[
            "inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]",
            "hover:text-[var(--accent-secondary)] transition-colors duration-200",
          ].join(" ")}
        >
          <ChevronLeft className="h-4 w-4" />
          My Orders
        </Link>
        <span className="text-sm text-[var(--text-muted)]">/</span>
        <h1 className="font-heading text-2xl font-normal text-[var(--text-primary)]">
          Messages
        </h1>
      </div>

      {/* Split panel */}
      <div className="flex flex-1 min-h-0 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-clay-sm overflow-hidden">
        {/* Left: Conversation list (hidden on mobile when chat room active) */}
        <div
          className={[
            "w-full md:w-[300px] md:shrink-0 border-r border-[var(--border-default)] overflow-y-auto",
            selectedOrderId ? "hidden md:block" : "block",
          ].join(" ")}
          style={{ overscrollBehavior: "contain" }}
        >
          <ConversationList
            conversations={conversations}
            selectedOrderId={selectedOrderId}
            onSelect={handleSelect}
            isLoading={isLoading}
          />
        </div>

        {/* Right: Chat room */}
        <div
          className={[
            "flex flex-col flex-1 min-h-0",
            selectedOrderId ? "block" : "hidden md:flex",
          ].join(" ")}
        >
          {selectedConv ? (
            <ChatRoom
              key={selectedConv.orderId}
              orderId={selectedConv.orderId}
              orderNumber={selectedConv.orderNumber}
              orderStatus={selectedConv.orderStatus}
              onBack={handleBack}
            />
          ) : (
            <NoConversationSelected />
          )}
        </div>
      </div>
    </div>
  );
}