"use client";

import {
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertCircle,
  Package,
  Box,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { AdminDashboardStats } from "../types";
import { formatPHP, formatTrendIndicator, adminQuickActions } from "../utils/formatting";

interface AdminDashboardProps {
  stats: AdminDashboardStats;
}

function TrendIndicator({ direction }: { direction: "up" | "down" | "stable" }) {
  const indicator = formatTrendIndicator(direction);
  const ariaLabel = direction === "up" ? "Up" : direction === "down" ? "Down" : "Stable";
  const colorClass =
    direction === "up"
      ? "text-state-success"
      : direction === "down"
        ? "text-state-error"
        : "text-text-muted";

  return (
    <span className={colorClass} aria-label={ariaLabel}>
      {indicator}
    </span>
  );
}

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
  badge?: string;
}

function KpiCard({ icon: Icon, label, value, trend, badge }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-bg-surface p-5 shadow-clay-sm transition-all duration-150 hover:shadow-clay-md hover:translate-y-[-2px]">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-bg-elevated p-2.5">
          <Icon className="h-5 w-5 text-accent-secondary" aria-hidden="true" />
        </div>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-state-error/10 px-2.5 py-0.5 text-xs font-semibold text-state-error">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <p className="mt-0.5 font-heading text-[32px] leading-[38px] font-normal text-text-primary">
          {value}
        </p>
        {trend && (
          <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
            <TrendIndicator direction={trend} />
            vs yesterday
          </p>
        )}
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

function QuickActionButton({ href, label, icon: Icon }: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl bg-bg-elevated px-4 py-3.5 text-sm font-medium text-text-primary transition-all duration-150 hover:shadow-clay-sm hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
    >
      <Icon className="h-5 w-5 text-accent-secondary shrink-0" aria-hidden="true" />
      <span className="flex-1">{label}</span>
      <ArrowRight
        className="h-4 w-4 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

// Map icon names to actual icon components
const iconMap = {
  ShoppingBag,
  Package,
  Box,
  MessageCircle,
  TrendingUp,
} as const;

export function AdminDashboard({ stats }: AdminDashboardProps) {
  return (
    <div>
      <h1 className="font-heading text-[32px] leading-[38px] font-normal text-text-primary">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-text-muted">Overview of your store at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Today — primary KPI, spans 2 cols on md+ */}
        <div className="md:col-span-2">
          <KpiCard
            icon={TrendingUp}
            label="Revenue Today"
            value={formatPHP(stats.revenueToday)}
            trend={stats.revenueTrend}
          />
        </div>

        {/* Orders Today */}
        <KpiCard
          icon={ShoppingBag}
          label="Orders Today"
          value={String(stats.ordersToday)}
          trend={stats.ordersTrend}
        />

        {/* Pending Orders */}
        <KpiCard icon={Clock} label="Pending Orders" value={String(stats.pendingOrders)} />

        {/* Low Stock Alerts */}
        <KpiCard
          icon={AlertCircle}
          label="Low Stock Alerts"
          value={String(stats.lowStockAlerts)}
          badge={stats.lowStockAlerts > 0 ? `${stats.lowStockAlerts} needs restock` : undefined}
        />

        {/* Chart Placeholder */}
        <div className="flex flex-col gap-3 rounded-2xl bg-bg-surface p-5 shadow-clay-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-bg-elevated p-2.5">
              <TrendingUp className="h-5 w-5 text-accent-secondary" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-text-muted">Revenue Trend (7 days)</p>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-xl bg-bg-elevated/50 min-h-[120px]">
            <p className="text-xs text-text-muted">Chart coming in Phase 10.8</p>
          </div>
        </div>

        {/* Quick Actions — full width on all breakpoints */}
        <div className="flex flex-col gap-3 rounded-2xl bg-bg-surface p-5 shadow-clay-sm md:col-span-2 lg:col-span-3">
          <p className="text-sm font-medium text-text-muted">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {adminQuickActions.map((action) => {
              const IconComponent = iconMap[action.iconName];
              return (
                <QuickActionButton
                  key={action.href}
                  href={action.href}
                  label={action.label}
                  icon={IconComponent}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
