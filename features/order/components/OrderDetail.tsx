"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ShoppingBag,
  Truck,
  Package,
  Clock,
  MapPin,
  CreditCard,
  Calendar,
  ChevronLeft,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { useOrder, type OrderDetailData } from "@/features/order/hooks/useOrders";
import { useOrderStatus } from "@/features/order/hooks/useOrderStatus";
import { useChatModalStore } from "@/features/order/store/chat-modal-store";
import ReviewSection from "@/features/review/components/ReviewSection";

// ── Status Timeline Configuration ─────────────────────

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
};

const STATUS_LABELS: Array<{ status: string; label: string }> = [
  { status: "PENDING", label: "Order Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PREPARING", label: "Preparing" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-5 w-5" />,
  CONFIRMED: <Check className="h-5 w-5" />,
  PREPARING: <Package className="h-5 w-5" />,
  OUT_FOR_DELIVERY: <Truck className="h-5 w-5" />,
  DELIVERED: <ShoppingBag className="h-5 w-5" />,
};

// ── Helpers ───────────────────────────────────────────

const timeSlotLabel = (slot: string): string => {
  switch (slot) {
    case "MORNING":
      return "Morning (8AM – 12PM)";
    case "AFTERNOON":
      return "Afternoon (12PM – 5PM)";
    case "EVENING":
      return "Evening (5PM – 8PM)";
    default:
      return slot;
  }
};

const paymentLabel = (method: string): string => {
  switch (method) {
    case "COD":
      return "Cash on Delivery";
    case "EWALLET":
      return "E-wallet Transfer";
    case "MANUAL":
      return "Manual Arrangement";
    default:
      return method;
  }
};

// ── Status Timeline ───────────────────────────────────

interface TimelineStep {
  status: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentStatusIndex = STATUS_ORDER[currentStatus] ?? 0;

  const timelineSteps: TimelineStep[] = STATUS_LABELS.map((step, index) => ({
    status: step.status,
    label: step.label,
    icon: STATUS_ICONS[step.status] ?? <Check className="h-5 w-5" />,
    isActive: index === currentStatusIndex,
    isCompleted: index < currentStatusIndex,
  }));

  return (
    <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 md:p-6 shadow-clay-sm">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
        Order Status
      </h2>
      <div className="flex flex-col gap-0">
        {timelineSteps.map((step, index) => (
          <div key={step.status} className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              {/* Connector line (above dot) — hidden for first step */}
              <div
                className={[
                  "w-0.5 h-6",
                  index === 0 ? "invisible" : "",
                  step.isCompleted || step.isActive
                    ? "bg-[var(--accent-primary)]"
                    : "bg-[var(--border-default)]",
                ].join(" ")}
              />
              {/* Dot */}
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 shrink-0",
                  step.isCompleted
                    ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-primary-foreground)]"
                    : step.isActive
                      ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-primary-foreground)]"
                      : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-muted)]",
                ].join(" ")}
              >
                {step.icon}
              </div>
              {/* Connector line (below dot) — hidden for last step */}
              <div
                className={[
                  "w-0.5 flex-1 min-h-[24px]",
                  index === timelineSteps.length - 1 ? "invisible" : "",
                  step.isCompleted
                    ? "bg-[var(--accent-primary)]"
                    : "bg-[var(--border-default)]",
                ].join(" ")}
              />
            </div>

            {/* Label + progress bar for active step */}
            <div className="flex flex-col justify-center pb-6 min-w-0 flex-1">
              <span
                className={[
                  "text-sm font-semibold",
                  step.isCompleted || step.isActive
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)]",
                ].join(" ")}
              >
                {step.label}
              </span>
              {step.isActive && (
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent-primary)] timeline-fill"
                    style={{
                      transformOrigin: "left center",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Cancelled State ───────────────────────────────────

function CancelledBanner() {
  return (
    <div className="rounded-[16px] border border-[var(--state-error)]/30 bg-[var(--state-error)]/5 p-5 md:p-6 shadow-clay-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--state-error)]/10">
          <XCircle className="h-6 w-6 text-[var(--state-error)]" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[var(--state-error)]">
            Order Cancelled
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            This order has been cancelled and will not be processed.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Order Detail Content ──────────────────────────────

interface OrderDetailContentProps {
  order: OrderDetailData;
}

function OrderDetailContent({ order }: OrderDetailContentProps) {
  const { status: liveStatus } = useOrderStatus(order.id, order.status);
  const [isVisible, setIsVisible] = useState(false);
  const openMessages = useChatModalStore((s) => s.openModal);

  // Entrance animation
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Parse delivery address from JSON string
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
      addr.zipCode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6 py-6 md:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link
          href="/orders"
          className="hover:text-[var(--accent-secondary)] transition-colors duration-200"
        >
          My Orders
        </Link>
        <span>/</span>
        <span className="font-mono font-semibold text-[var(--text-primary)]">
          {order.orderNumber}
        </span>
      </nav>

      {/* Order header */}
      <div>
        <h1 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Order Details
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Placed on {orderDate}
        </p>
      </div>

      {/* Order summary card — entrance animation */}
      <div
        className={[
          "rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 md:p-6 shadow-clay-md",
          "transition-all duration-300 ease-out",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.95]",
        ].join(" ")}
        style={{
          transitionProperty: "opacity, transform",
        }}
      >
        {/* Order number */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Order Summary
          </h2>
          <span className="text-sm font-mono font-semibold text-[var(--accent-secondary)]">
            {order.orderNumber}
          </span>
        </div>

        {/* Items */}
        <section className="mb-4">
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">
            Items ({order.items.length})
          </h3>
          <ul className="flex flex-col gap-2">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-[8px] bg-[var(--bg-elevated)] p-2.5"
              >
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="h-12 w-12 shrink-0 rounded-[6px] object-cover"
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] bg-[var(--bg-surface)]">
                    <ShoppingBag className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Qty: {item.quantity}
                      {item.variantName ? ` · ${item.variantName}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)] shrink-0">
                    ₱{item.itemTotal.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="h-px bg-[var(--border-default)] my-4" />

        {/* Delivery Address */}
        <section className="mb-3 flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)]">
              Delivery Address
            </h3>
            <p className="text-sm text-[var(--text-primary)]">
              {formatAddress(parsedAddress)}
            </p>
          </div>
        </section>

        {/* Delivery Date & Time */}
        <section className="mb-3 flex items-start gap-3">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)]">
              Preferred Delivery
            </h3>
            <p className="text-sm text-[var(--text-primary)]">
              {new Date(order.deliveryDate).toLocaleDateString("en-PH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              &nbsp;&middot;&nbsp;
              {timeSlotLabel(order.deliverySlot)}
            </p>
          </div>
        </section>

        {/* Payment Method */}
        <section className="mb-3 flex items-start gap-3">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)]">
              Payment Method
            </h3>
            <p className="text-sm text-[var(--text-primary)]">
              {paymentLabel(order.paymentMethod)}
            </p>
          </div>
        </section>

        <div className="h-px bg-[var(--border-default)] my-4" />

        {/* Total */}
        <section className="flex items-center justify-between">
          <span className="text-base font-bold text-[var(--text-primary)]">
            Order Total
          </span>
          <span className="text-base font-bold text-[var(--text-primary)]">
            ₱{order.orderTotal.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </section>
      </div>

      {/* Status section — timeline or cancelled banner */}
      {liveStatus === "CANCELLED" ? (
        <CancelledBanner />
      ) : (
        <StatusTimeline currentStatus={liveStatus} />
      )}

      {/* Review section — only for DELIVERED orders */}
      {order.items.length > 0 && (
        <ReviewSection
          orderId={order.id}
          orderStatus={liveStatus}
          productId={order.items[0].productId}
          hasExistingReview={order.items[0].hasReview ?? false}
          existingReviewText={order.orderReviewText}
        />
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Link
          href="/orders"
          className={[
            "inline-flex items-center gap-2 rounded-[12px] px-6 py-2.5 text-sm font-semibold",
            "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            "bg-[var(--bg-surface)] border border-[var(--border-default)]",
            "hover:bg-[var(--bg-elevated)] active:scale-95",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
          ].join(" ")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <button
          type="button"
          onClick={() => openMessages(order.id)}
          className={[
            "inline-flex items-center gap-2 rounded-[12px] px-6 py-2.5 text-sm font-semibold",
            "text-[var(--accent-secondary)] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20",
            "hover:bg-[var(--accent-primary)]/20 active:scale-95",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
          ].join(" ")}
        >
          <MessageSquare className="h-4 w-4" />
          Contact Seller
        </button>
      </div>
    </div>
  );
}

// ── Order Detail Shell ────────────────────────────────

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const { data, isLoading, isError } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl flex flex-col gap-6 py-6 md:py-8 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-40 rounded bg-[var(--bg-elevated)]" />
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-[var(--bg-elevated)]" />
          <div className="h-4 w-60 rounded bg-[var(--bg-elevated)]" />
        </div>
        {/* Summary card skeleton */}
        <div className="h-96 rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border-default)] p-5" />
        {/* Timeline skeleton */}
        <div className="h-64 rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border-default)] p-5" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="text-[var(--text-muted)]">Order not found.</p>
        <Link
          href="/orders"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  return <OrderDetailContent order={data.data} />;
}