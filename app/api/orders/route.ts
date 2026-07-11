import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { CreateOrderSchema } from "@/lib/validators/order";
import { createOrder } from "@/lib/dal/order";

function correlationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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
 * GET /api/orders
 *
 * Returns the authenticated user's orders list, paginated (20 per page).
 */
export async function GET(request: NextRequest) {
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
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? "1") || 1);
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const ordersRaw = await prisma.order.findMany({
      where: { userId: internalUserId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          select: { quantity: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    const total = await prisma.order.count({ where: { userId: internalUserId } });

    const orders = ordersRaw as unknown as Array<{
      id: string;
      orderNumber: string;
      status: string;
      total: unknown;
      createdAt: Date;
      items: Array<{ quantity: number }>;
    }>;

    const data = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      orderTotal: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return NextResponse.json({
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 *
 * Creates an order from the authenticated user's cart.
 */
export async function POST(request: NextRequest) {
  const cid = correlationId();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 attempts per user per minute
  const rl = rateLimit(`orders:create:${userId}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const result = await createOrder(userId, parsed.data);
    return NextResponse.json(
      {
        data: {
          orderId: result.id,
          orderNumber: result.orderNumber,
          orderTotal: result.orderTotal,
          estimatedDelivery: result.estimatedDelivery,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[${cid}] POST /api/orders error:`, error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}