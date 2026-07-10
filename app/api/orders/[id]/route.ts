import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";

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
 * GET /api/orders/[id]
 *
 * Returns full order detail for the authenticated user.
 * Returns 404 if not found or wrong owner.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let internalUserId: string;
  try {
    internalUserId = await resolveUserId(userId);
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const { id } = await params;
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
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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

    const itemCount = order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

    const STATUS_ORDER: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 1,
      PREPARING: 2,
      OUT_FOR_DELIVERY: 3,
      DELIVERED: 4,
    };

    const currentStatusIndex = STATUS_ORDER[order.status] ?? 0;

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
      updatedAt: order.updatedAt.toISOString(),
      itemCount,
      items: order.items.map((item) => {
        const price = Number(item.price);
        return {
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.images[0]?.url ?? null,
          variantId: item.variantId,
          variantName: item.variant?.name ?? null,
          quantity: item.quantity,
          customizations: item.customizations as Record<string, unknown>,
          unitPrice: price,
          itemTotal: Math.round((price * item.quantity + Number.EPSILON) * 100) / 100,
        };
      }),
      statusTimeline: [
        { status: "PENDING" as const, label: "Order Placed", date: order.createdAt.toISOString() },
        { status: "CONFIRMED" as const, label: "Confirmed", date: null },
        { status: "PREPARING" as const, label: "Preparing", date: null },
        { status: "OUT_FOR_DELIVERY" as const, label: "Out for Delivery", date: null },
        { status: "DELIVERED" as const, label: "Delivered", date: null },
      ].filter((step) => (STATUS_ORDER[step.status] ?? 0) <= currentStatusIndex),
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}