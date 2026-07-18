import { requireAdminRoleOrRedirect } from "@/lib/admin/auth";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { QueryProvider } from "@/lib/hooks/QueryProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminRoleOrRedirect();

  return (
    <AdminShell>
      <QueryProvider>{children}</QueryProvider>
    </AdminShell>
  );
}
