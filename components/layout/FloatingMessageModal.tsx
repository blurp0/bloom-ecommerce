"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ExternalLink, MapPin, Calendar, CreditCard } from "lucide-react";
import { useConversations } from "@/features/messages/hooks/useConversations";
import { useOrder, type OrderDetailData } from "@/features/order/hooks/useOrders";
import { useChatModalStore } from "@/features/order/store/chat-modal-store";
import ConversationList from "@/features/messages/components/ConversationList";
import MessageThread from "@/features/order/components/MessageThread";
import MessageInput from "@/features/order/components/MessageInput";

// ── Helpers ───────────────────────────────────────────

const timeSlotLabel = (slot: string): string => {
  switch (slot) {
    case "MORNING": return "Morning (8AM–12PM)";
    case "AFTERNOON": return "Afternoon (12PM–5PM)";
    case "EVENING": return "Evening (5PM–8PM)";
    default: return slot;
  }
};

const paymentLabel = (method: string): string => {
  switch (method) {
    case "COD": return "Cash on Delivery";
    case "EWALLET": return "E-Wallet Transfer";
    case "MANUAL": return "Manual Arrangement";
    default: return method;
  }
};

const statusLabel = (s: string) =>
  s === "OUT_FOR_DELIVERY"
    ? "Out for Delivery"
    : s.charAt(0) + s.slice(1).toLowerCase();

const statusBadgeColors: Record<string, string> = {
  PENDING: "bg-[var(--state-warning)]/10 text-[var(--state-warning)] border-[var(--state-warning)]/20",
  CONFIRMED: "bg-[var(--accent-primary)]/10 text-[var(--accent-primary-foreground)] border-[var(--accent-primary)]/20",
  PREPARING: "bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary-foreground)] border-[var(--accent-secondary)]/20",
  OUT_FOR_DELIVERY: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  DELIVERED: "bg-[var(--state-success)]/10 text-[var(--state-success)] border-[var(--state-success)]/20",
  CANCELLED: "bg-[var(--state-error)]/10 text-[var(--state-error)] border-[var(--state-error)]/20",
};

// ── Collapsible Order Summary ──────────────────────────

function OrderSummaryCollapse({ order }: { order: OrderDetailData }) {
  const [expanded, setExpanded] = useState(false);

  let parsedAddress: Record<string, string> = {};
  try {
    parsedAddress = JSON.parse(order.deliveryAddress);
  } catch {
    parsedAddress = { raw: order.deliveryAddress };
  }

  const formatAddress = (addr: Record<string, string>): string => {
    const parts = [
      addr.recipientName || addr.fullName,
      addr.street,
      addr.barangay,
      addr.city,
      addr.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="border-b border-[var(--border-default)]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-primary)]"
      >
        <span>Order Details</span>
        <ChevronDown
          className={[
            "h-3.5 w-3.5 transition-transform duration-200",
            expanded ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1 flex flex-col gap-2 text-xs">
          {/* Items */}
          <div>
            <span className="font-medium text-[var(--text-muted)]">Items:</span>
            <ul className="mt-0.5 flex flex-col gap-1">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-[var(--text-primary)]">
                  <span className="truncate flex-1 min-w-0">
                    {item.productName} × {item.quantity}
                    {item.variantName ? ` · ${item.variantName}` : ""}
                  </span>
                  <span className="shrink-0 ml-2">
                    ₱{item.itemTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery */}
          <div className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[var(--text-muted)]" />
            <span className="text-[var(--text-primary)]">{formatAddress(parsedAddress)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
            <span className="text-[var(--text-primary)]">
              {new Date(order.deliveryDate).toLocaleDateString("en-PH", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              &nbsp;&middot;&nbsp;
              {timeSlotLabel(order.deliverySlot)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
            <span className="text-[var(--text-primary)]">{paymentLabel(order.paymentMethod)}</span>
          </div>

          {/* Total */}
          <div className="flex justify-between pt-2 border-t border-[var(--border-default)]">
            <span className="font-semibold text-[var(--text-primary)]">Total</span>
            <span className="font-semibold text-[var(--text-primary)]">
              ₱{order.orderTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat Room ───────────────────────────────────────────

interface ChatRoomProps {
  orderId: string;
}

function ChatRoom({ orderId }: ChatRoomProps) {
  // Fetch full order detail for the collapsible summary
  const { data: orderData } = useOrder(orderId);
  const order = orderData?.data;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Order summary — collapsible */}
      {order ? (
        <OrderSummaryCollapse order={order} />
      ) : (
        <div className="shrink-0 border-b border-[var(--border-default)] px-4 py-2">
          <Link
            href={`/orders/${orderId}`}
            onClick={(e) => e.stopPropagation()}
            className={[
              "inline-flex items-center gap-1.5 text-xs font-medium",
              "text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)]",
              "transition-colors duration-150",
            ].join(" ")}
          >
            View order details
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Thread — fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden px-2">
        <MessageThread orderId={orderId} currentUserRole="CUSTOMER" />
      </div>

      {/* Input — pinned to bottom */}
      <div className="shrink-0 px-4 pb-3 pt-2">
        <MessageInput orderId={orderId} currentUserRole="CUSTOMER" />
      </div>
    </div>
  );
}

// ── Floating Modal ────────────────────────────────────

/**
 * Floating slide-in sheet for the messaging hub.
 *
 * Single-view push navigation: conversation list → chat room.
 * Chat room has collapsible order summary above the messages.
 *
 * Controlled by useChatModalStore — any component can open with a target orderId.
 */
export default function FloatingMessageModal() {
  const { open, targetOrderId, closeModal } = useChatModalStore();
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Fetch order detail when targetOrderId is not in conversations (new chat — no messages yet)
  const needsFallbackOrder =
    open && targetOrderId && !conversations.some((c) => c.orderId === targetOrderId);
  const { data: fallbackOrderData, isLoading: fallbackLoading } = useOrder(
    needsFallbackOrder ? targetOrderId : "",
  );
  const fallbackOrder = fallbackOrderData?.data;

  // On open, pre-select targetOrderId if provided
  useEffect(() => {
    if (open && targetOrderId) {
      setSelectedOrderId(targetOrderId);
    } else if (!open) {
      setSelectedOrderId(null);
    }
  }, [open, targetOrderId]);

  const selectedConv = conversations.find(
    (c) => c.orderId === selectedOrderId,
  );

  // Synthetic conversation for orders with no messages yet (contact seller flow)
  const hasFallbackConv = selectedOrderId && !selectedConv && fallbackOrder;

  // Header label: from conversations list, or from fallback order data
  const headerLabel =
    selectedConv?.itemLabel ??
    (fallbackOrder
      ? fallbackOrder.items.length === 1
        ? fallbackOrder.items[0].productName
        : `${fallbackOrder.items[0]?.productName ?? "Order"} & ${fallbackOrder.items.length - 1} more`
      : selectedConv?.orderNumber ?? "");

  const headerStatus = selectedConv?.orderStatus ?? fallbackOrder?.status ?? "";

  const handleSelect = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedOrderId(null);
  }, []);

  if (!open) return null;

  const isInRoom = !!(selectedOrderId && (selectedConv || hasFallbackConv));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs transition-opacity duration-150"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Panel — slide-in from right */}
      <div
        className={[
          "fixed z-50 bg-[var(--bg-surface)]",
          "flex flex-col",
          "inset-y-0 right-0",
          "w-full sm:w-[480px] lg:w-[540px]",
          "max-w-full",
          "border-l border-[var(--border-default)]",
          "shadow-lg",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Messages"
      >
        {/* Header — single header, no duplication */}
        <div className="shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)]">
            {isInRoom && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center h-8 w-8 rounded-[8px] hover:bg-[var(--bg-elevated)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5 text-[var(--text-primary)]" />
              </button>
            )}

            {isInRoom ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-heading text-base font-normal text-[var(--text-primary)] truncate">
                  {headerLabel}
                </span>
                {headerStatus && (
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium shrink-0",
                      statusBadgeColors[headerStatus] ?? statusBadgeColors.PENDING,
                    ].join(" ")}
                  >
                    {statusLabel(headerStatus)}
                  </span>
                )}
              </div>
            ) : (
              <h2 className="font-heading text-lg font-normal text-[var(--text-primary)] flex-1">
                Messages
              </h2>
            )}

            <button
              type="button"
              onClick={closeModal}
              className="flex items-center justify-center h-9 w-9 rounded-[12px] hover:bg-[var(--bg-elevated)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              aria-label="Close messages"
            >
              <svg
                className="h-5 w-5 text-[var(--text-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body — list or chat room */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {isInRoom && selectedOrderId ? (
            // Show chat room when: (a) conv exists in list, OR (b) fallback order loaded
            // Loading state while fallback order data loads
            fallbackLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-sm text-[var(--text-muted)]">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-transparent" />
                  Loading chat…
                </div>
              </div>
            ) : (
              <ChatRoom
                key={selectedOrderId}
                orderId={selectedOrderId}
              />
            )
          ) : (
            <div
              className="flex-1 overflow-y-auto"
              style={{ overscrollBehavior: "contain" }}
            >
              <ConversationList
                conversations={conversations}
                selectedOrderId={selectedOrderId}
                onSelect={handleSelect}
                isLoading={conversationsLoading}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}