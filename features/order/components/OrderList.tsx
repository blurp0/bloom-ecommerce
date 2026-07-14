"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useOrders } from "@/features/order/hooks/useOrders";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import type { OrderListItem } from "../types";
import { STATUS_STYLES, formatOrderDate, formatPHP } from "../utils/formatting";

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    bg: "bg-[var(--bg-elevated)]",
    text: "text-[var(--text-muted)]",
    dot: "bg-[var(--text-muted)]",
    label: status,
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        style.bg,
        style.text,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

// ── Order Row ─────────────────────────────────────────

interface OrderRowProps {
  order: OrderListItem;
}

function OrderRow({ order }: OrderRowProps) {
  const handleReorder = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Fetch the full order to get item details
      const res = await fetch(`/api/orders/${order.id}`);
      if (!res.ok) throw new Error("Failed to fetch order details");

      const json = await res.json();
      const items: Array<{ productId: string; variantId: string | null; quantity: number; customizations: Record<string, unknown> }> =
        json.data?.items ?? [];

      if (items.length === 0) {
        toast.info("This order has no items to reorder");
        return;
      }

      let addedCount = 0;
      let skippedCount = 0;

      const addResults = await Promise.allSettled(
        items.map((item) => {
          const c = (item.customizations as Record<string, unknown>) ?? {};
          const payload: Record<string, unknown> = {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            customization: {},
          };

          const cust = payload.customization as Record<string, unknown>;

          if (c.size) cust.size = c.size;
          if (c.color) cust.color = c.color;
          if (c.addOns) cust.addOns = c.addOns ?? [];
          if (c.messageCard) cust.messageCard = c.messageCard;

          // If customization ended up empty, remove it to send a clean payload
          if (Object.keys(cust).length === 0) {
            delete payload.customization;
          }

          return fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        })
      );

      for (const result of addResults) {
        if (result.status === "fulfilled" && result.value.ok) {
          addedCount++;
        } else {
          skippedCount++;
        }
      }

      if (addedCount > 0) {
        toast.success(`${addedCount} item${addedCount > 1 ? "s" : ""} added to cart`);
      }
      if (skippedCount > 0) {
        toast.info(
          "Some items are no longer available and were not added"
        );
      }
    } catch {
      toast.error("Something went wrong — please try again");
    }
  };

  const orderDate = formatOrderDate(order.createdAt);

  return (
    <div
      className={[
        "group flex flex-col gap-3 rounded-[16px] border border-[var(--border-default)]",
        "bg-[var(--bg-surface)] p-4 md:p-5 shadow-clay-sm",
        "hover:translate-y-[-2px] hover:shadow-clay-md",
        "transition-all duration-200 ease-out",
      ].join(" ")}
    >
      <Link
        href={`/orders/${order.id}`}
        className="flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-md"
      >
        {/* Left: order info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-[var(--accent-secondary)]">
              {order.orderNumber}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {orderDate} &middot; {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Right: total */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-base font-bold text-[var(--text-primary)]">
            {formatPHP(order.orderTotal)}
          </span>
        </div>
      </Link>

      {/* Reorder button + View detail indicator as siblings */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleReorder}
          className={[
            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold",
            "text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)]",
            "bg-[var(--bg-elevated)] hover:bg-[var(--accent-primary)]/20",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
          ].join(" ")}
        >
          <RefreshCw className="h-3 w-3" />
          Reorder
        </button>

        <Link
          href={`/orders/${order.id}`}
          className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--accent-secondary)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-sm"
        >
          View Details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ── Order Row Skeleton ────────────────────────────────

function OrderRowSkeleton() {
  return (
    <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 md:p-5 shadow-clay-sm animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 rounded bg-[var(--bg-elevated)]" />
            <div className="h-5 w-20 rounded-full bg-[var(--bg-elevated)]" />
          </div>
          <div className="h-3 w-40 rounded bg-[var(--bg-elevated)]" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-5 w-20 rounded bg-[var(--bg-elevated)]" />
          <div className="h-6 w-16 rounded bg-[var(--bg-elevated)]" />
        </div>
      </div>
    </div>
  );
}

// ── OrderList ─────────────────────────────────────────

export default function OrderList() {
  const { data, isLoading, isError, error } = useOrders();

  const orders = useMemo(() => data?.data ?? [], [data]);

  // Error state
  if (isError) {
    return (
      <EmptyState
        title="Couldn't Load Orders"
        description={error?.message ?? "Something went wrong. Please try again."}
        icon={<AlertCircle className="h-10 w-10 text-[var(--state-error)]" />}
        primaryAction={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={[
              "clay-button inline-flex items-center gap-2 rounded-[12px] px-6 py-2.5 text-sm font-semibold",
              "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
              "hover:bg-[var(--accent-primary-hover)] active:scale-95",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
            ].join(" ")}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        }
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <OrderRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Yet"
        description="When you place an order, you'll see it here."
        icon={<Package className="h-10 w-10 text-[var(--text-muted)]" />}
        primaryAction={
          <Link
            href="/products"
            className={[
              "clay-button inline-flex items-center gap-2 rounded-[12px] px-6 py-2.5 text-sm font-semibold",
              "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
              "hover:bg-[var(--accent-primary-hover)] active:scale-95",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
            ].join(" ")}
          >
            <ShoppingBag className="h-4 w-4" />
            Start Shopping
          </Link>
        }
      />
    );
  }

  // Orders list
  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
}