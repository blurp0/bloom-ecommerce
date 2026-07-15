/**
 * Admin feature types
 * Shared across admin components, hooks, and utilities
 */

export interface AdminDashboardStats {
  ordersToday: number;
  ordersTrend: "up" | "down" | "stable";
  revenueToday: number;
  revenueTrend: "up" | "down" | "stable";
  pendingOrders: number;
  lowStockAlerts: number;
}

export type TrendDirection = "up" | "down" | "stable";

export interface AdminKpiCard {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  value: string;
  trend?: TrendDirection;
  badge?: string;
  badgeColor?: "red" | "default";
}

export interface AdminQuickAction {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}
