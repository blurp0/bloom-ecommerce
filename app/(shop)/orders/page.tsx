import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OrderList from "@/features/order/components/OrderList";

export const metadata = {
  title: "My Orders | Bloom & Bind",
  description: "View and track your orders.",
};

/**
 * Orders list page — auth-gated server component.
 * Redirects unauthenticated users to sign-in.
 */
export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/orders");
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6 py-4 md:py-8">
      <div>
        <h1 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          View and track all your orders.
        </p>
      </div>
      <OrderList />
    </div>
  );
}