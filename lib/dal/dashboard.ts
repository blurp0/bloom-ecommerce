import { prisma } from "@/lib/prisma/client";
import { OrderStatus } from "@prisma/client";

export interface DashboardStats {
  ordersToday: number;
  ordersTrend: "up" | "down" | "stable";
  revenueToday: number;
  revenueTrend: "up" | "down" | "stable";
  pendingOrders: number;
  lowStockAlerts: number;
}

function getManilaDayRange(date: Date = new Date()): { startOfDay: Date; endOfDay: Date } {
  const manilaOffset = 8 * 60 * 60 * 1000;
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const manilaMs = utcMs + manilaOffset;
  const manilaDate = new Date(manilaMs);

  const startOfDayMs =
    Date.UTC(manilaDate.getUTCFullYear(), manilaDate.getUTCMonth(), manilaDate.getUTCDate(), 0, 0, 0, 0) -
    manilaOffset;

  const endOfDayMs =
    Date.UTC(manilaDate.getUTCFullYear(), manilaDate.getUTCMonth(), manilaDate.getUTCDate() + 1, 0, 0, 0, 0) -
    manilaOffset;

  return { startOfDay: new Date(startOfDayMs), endOfDay: new Date(endOfDayMs) };
}

export function getTrendDirection(value: number, previousValue: number): "up" | "down" | "stable" {
  if (value > previousValue) return "up";
  if (value < previousValue) return "down";
  return "stable";
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = getManilaDayRange();
  const yesterday = getManilaDayRange(new Date(Date.now() - 86_400_000));

  const todayOrderCount = prisma.order.count({
    where: { createdAt: { gte: today.startOfDay, lt: today.endOfDay } },
  });

  const todayRevenueAgg = prisma.order.aggregate({
    where: { createdAt: { gte: today.startOfDay, lt: today.endOfDay } },
    _sum: { total: true },
  });

  const pendingCount = prisma.order.count({
    where: { status: OrderStatus.PENDING },
  });

  const yesterdayOrderCount = prisma.order.count({
    where: { createdAt: { gte: yesterday.startOfDay, lt: yesterday.endOfDay } },
  });

  const yesterdayRevenueAgg = prisma.order.aggregate({
    where: { createdAt: { gte: yesterday.startOfDay, lt: yesterday.endOfDay } },
    _sum: { total: true },
  });

  const [lowStockResult] = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::int AS count FROM "Inventory" WHERE "quantity" <= "lowStock"
  `;

  const [ordersToday, revenueToday, pendingOrders, ordersYesterday, revenueYesterday] = await Promise.all([
    todayOrderCount,
    todayRevenueAgg,
    pendingCount,
    yesterdayOrderCount,
    yesterdayRevenueAgg,
  ]);

  const revenueTodayVal = Number(revenueToday._sum.total ?? 0);
  const revenueYesterdayVal = Number(revenueYesterday._sum.total ?? 0);

  return {
    ordersToday,
    ordersTrend: getTrendDirection(ordersToday, ordersYesterday),
    revenueToday: revenueTodayVal,
    revenueTrend: getTrendDirection(revenueTodayVal, revenueYesterdayVal),
    pendingOrders,
    lowStockAlerts: Number(lowStockResult.count),
  };
}
