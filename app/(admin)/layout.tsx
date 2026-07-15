import { requireAdminRoleOrRedirect } from "@/lib/admin/auth";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminRoleOrRedirect();

  return <AdminShell>{children}</AdminShell>;
}