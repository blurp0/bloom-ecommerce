import { redirect } from "next/navigation";
import { requireRole } from "@/lib/clerk/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole("SELLER");
  } catch {
    redirect("/");
  }

  return <>{children}</>;
}
