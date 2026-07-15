import type { Metadata } from "next";
import { requireAdminRoleOrRedirect } from "@/lib/admin/auth";
import { getDashboardStats } from "@/lib/dal/dashboard";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard — Bloom & Bind",
};

export default async function AdminDashboardPage() {
  const user = await requireAdminRoleOrRedirect();
  const stats = await getDashboardStats();

  return <AdminDashboard stats={stats} />;
}