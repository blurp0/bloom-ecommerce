import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";

/**
 * Resolve Clerk ID to internal User.id using findUnique.
 */
async function resolveUserId(clerkId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) throw new Error("User not found");
  return user.id;
}

/** Inferred type for the queried order with its nested includes. */
type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            name: true;
            images: {
              take: 1;
              orderBy: { order: "asc" };
              select: { url: true };
            };
          };
        };
        variant: {
          select: { name: true };
        };
      };
    };
    reviews: {
      where: { userId: string };
      select: { id: true; comment: true };
    };
  };
}>;

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
    const order = await prisma.order.findFirst({
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
        reviews: {
          where: { userId: internalUserId },
          select: { id: true, comment: true },
        },
      },
    }) as OrderWithItems | null;

    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const hasOrderReview = order.reviews.length > 0;
    const orderReviewText = order.reviews[0]?.comment ?? undefined;

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
      hasReview: hasOrderReview,
      orderReviewText,
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