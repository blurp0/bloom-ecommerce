/**
 * Admin dashboard statistics hook
 * Fetches KPI data for the admin dashboard using TanStack Query
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import type { AdminDashboardStats } from "../types";

async function fetchDashboardStats(): Promise<AdminDashboardStats> {
  const response = await fetch("/api/admin/stats");
  if (!response.ok) throw new Error("Failed to fetch dashboard stats");
  const json = await response.json();
  return json.data;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}
