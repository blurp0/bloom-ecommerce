import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk/roles";
import { prisma } from "@/lib/prisma/client";
import { ablyServer } from "@/lib/ably/server";
import { UpdateOrderStatusSchema } from "@/lib/validators/order";
import { isValidTransition } from "@/lib/order/state-machine";
import { updateOrderStatus as updateOrderStatusDAL } from "@/lib/dal/order";
import type { OrderStatus } from "@prisma/client";

/**
 * PUT /api/orders/[id]/status
 *
 * Seller-only endpoint that transitions an order through the state machine.
 * Publishes a real-time status-updated event via Ably on success.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Auth check
  try {
    await requireRole("SELLER");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "401") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: orderId } = await params;

  // 2. Zod validation
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = UpdateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 },
    );
  }

  // 3. Fetch current order
  const currentOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, orderNumber: true },
  });

  if (!currentOrder) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const currentStatus = currentOrder.status as OrderStatus;
  const newStatus = parsed.data.status as OrderStatus;

  // 4. Validate transition
  if (!isValidTransition(currentStatus, newStatus)) {
    return NextResponse.json(
      {
        error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
      },
      { status: 400 },
    );
  }

  // 5. Update in DB
  const updated = await updateOrderStatusDAL(orderId, newStatus);

  // 6. Publish Ably event (after DB write succeeds)
  try {
    const channel = ablyServer.channels.get(`order:${orderId}`);
    await channel.publish("status-updated", { status: newStatus });
  } catch (err) {
    console.error(`Failed to publish Ably event for order ${orderId}:`, err);
    // Event publish failure should not fail the request —
    // the DB update already succeeded.
  }

  // 7. Return success
  return NextResponse.json({
    data: {
      id: updated.id,
      status: updated.status,
    },
  });
}