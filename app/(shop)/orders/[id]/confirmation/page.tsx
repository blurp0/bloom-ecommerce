import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import OrderConfirmation from "@/features/order/components/OrderConfirmation";

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

/**
 * Order confirmation page.
 *
 * Server component — fetches the order and verifies ownership.
 * Redirects to /orders if not found or wrong user.
 */
export default async function OrderConfirmationPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=" + encodeURIComponent(`/orders/${(await params).id}/confirmation`));
  }

  const { id } = await params;

  // Resolve Clerk ID to internal User.id for ownership check
  let internalUserId: string;
  try {
    internalUserId = await resolveUserId(userId);
  } catch {
    redirect("/orders");
  }

  const orderRaw = await prisma.order.findFirst({
    where: { id, userId: internalUserId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: {
                take: 1,
                orderBy: { order: "asc" },
                select: { url: true },
              },
            },
          },
          variant: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!orderRaw) {
    redirect("/orders");
  }

  const order = orderRaw as unknown as {
    id: string;
    orderNumber: string;
    status: string;
    total: unknown;
    deliveryAddress: string;
    deliveryDate: Date;
    deliverySlot: string;
    paymentMethod: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      productId: string;
      variantId: string | null;
      quantity: number;
      customizations: unknown;
      price: unknown;
      product: { name: string; images: { url: string }[] };
      variant: { name: string } | null;
    }>;
  };

  const data = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    orderTotal: Number(order.total),
    deliveryAddress: order.deliveryAddress,
    deliveryDate: order.deliveryDate.toISOString(),
    deliverySlot: order.deliverySlot,
    paymentMethod: order.paymentMethod,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0]?.url ?? null,
      variantName: item.variant?.name ?? null,
      quantity: item.quantity,
      customizations: item.customizations as Record<string, unknown>,
      unitPrice: Number(item.price),
      itemTotal: Math.round((Number(item.price) * item.quantity + Number.EPSILON) * 100) / 100,
    })),
  };

  return <OrderConfirmation order={data} />;
}