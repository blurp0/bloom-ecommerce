import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import OrderDetail from "@/features/order/components/OrderDetail";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Resolve Clerk ID to internal User.id.
 */
async function resolveUserId(clerkId: string): Promise<string> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1
  `;
  if (!rows[0]) throw new Error("User not found");
  return rows[0].id;
}

export const metadata = {
  title: "Order Details | Bloom & Bind",
  description: "View your order details and track status.",
};

/**
 * Order detail page.
 *
 * Server component — verifies auth and ownership.
 * Redirects to /orders if not found or wrong owner.
 * Renders the OrderDetail client component for interactive timeline.
 */
export default async function OrderDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=" + encodeURIComponent(`/orders/${(await params).id}`));
  }

  const { id } = await params;

  // Resolve Clerk ID to internal User.id for ownership check
  let internalUserId: string;
  try {
    internalUserId = await resolveUserId(userId);
  } catch {
    redirect("/orders");
  }

  // Ownership-scoped query — returns 404 if not found or wrong owner
  const order = await prisma.order.findFirst({
    where: { id, userId: internalUserId },
    select: { id: true },
  });

  if (!order) {
    redirect("/orders");
  }

  return <OrderDetail orderId={id} />;
}