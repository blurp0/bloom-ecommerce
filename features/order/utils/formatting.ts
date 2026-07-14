import type { StatusStyle } from "../types";

// ── Status Badge Styling ─────────────────────────────

export const STATUS_STYLES: Record<string, StatusStyle> = {
  PENDING: {
    bg: "bg-[var(--state-warning)]/10",
    text: "text-[var(--state-warning)]",
    dot: "bg-[var(--state-warning)]",
    label: "Pending",
  },
  CONFIRMED: {
    bg: "bg-[var(--accent-primary)]/30",
    text: "text-[var(--accent-primary-foreground)]",
    dot: "bg-[var(--accent-secondary)]",
    label: "Confirmed",
  },
  PREPARING: {
    bg: "bg-purple-100 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
    label: "Preparing",
  },
  OUT_FOR_DELIVERY: {
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    label: "Out for Delivery",
  },
  DELIVERED: {
    bg: "bg-[var(--state-success)]/10",
    text: "text-[var(--state-success)]",
    dot: "bg-[var(--state-success)]",
    label: "Delivered",
  },
  CANCELLED: {
    bg: "bg-[var(--state-error)]/10",
    text: "text-[var(--state-error)]",
    dot: "bg-[var(--state-error)]",
    label: "Cancelled",
  },
};

// ── Display Labels ───────────────────────────────────

export function timeSlotLabel(slot: string): string {
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
}

export function paymentLabel(method: string): string {
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
}

// ── Date Formatting ──────────────────────────────────

export function formatOrderDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatOrderDateFull(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Address Parsing ──────────────────────────────────

export function parseDeliveryAddress(
  jsonStr: string,
): Record<string, string> {
  try {
    return JSON.parse(jsonStr);
  } catch {
    return { raw: jsonStr };
  }
}

export function formatAddress(addr: Record<string, string>): string {
  const parts = [
    addr.recipientName || addr.fullName,
    addr.street,
    addr.barangay,
    addr.city,
    addr.province,
    addr.zipCode,
  ].filter(Boolean);
  return parts.join(", ");
}

// ── Status Timeline Config ────────────────────────────

export const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  CANCELLED: -1,
};

export const STATUS_LABELS: Array<{ status: string; label: string }> = [
  { status: "PENDING", label: "Order Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PREPARING", label: "Preparing" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
  { status: "CANCELLED", label: "Cancelled" },
];

// STATUS_ICONS is defined in components that use it (contains JSX)

// ── Price Formatting ─────────────────────────────────

export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}