/**
 * Admin formatting utilities
 * Reusable helpers for displaying admin data
 */

export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatTrendIndicator(direction: "up" | "down" | "stable"): string {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "→";
}

export const adminNavItems = [
  { href: "/admin", label: "Dashboard", iconName: "LayoutDashboard" as const },
  { href: "/admin/products", label: "Products", iconName: "Package" as const },
  { href: "/admin/orders", label: "Orders", iconName: "ShoppingBag" as const },
  { href: "/admin/inventory", label: "Inventory", iconName: "Box" as const },
  { href: "/admin/messages", label: "Messages", iconName: "MessageCircle" as const },
  { href: "/admin/analytics", label: "Analytics", iconName: "BarChart3" as const },
];

export const adminQuickActions = [
  { href: "/admin/orders", label: "View All Orders", iconName: "ShoppingBag" as const },
  { href: "/admin/products", label: "Manage Products", iconName: "Package" as const },
  { href: "/admin/inventory", label: "Check Inventory", iconName: "Box" as const },
  { href: "/admin/messages", label: "View Messages", iconName: "MessageCircle" as const },
];
