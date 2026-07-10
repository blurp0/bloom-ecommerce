import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import { AddToCartSchema } from "@/lib/validators/cart";
import { getCart, addCartItem } from "@/lib/dal/cart";

/**
 * GET /api/cart
 *
 * Return the authenticated user's cart with all items,
 * computed subtotal, and item count.
 * Creates an empty cart row via upsert if none exists.
 */
export async function GET() {
  // 1. Authenticate
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Look up User by clerkId
  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Fetch cart (upserts if none exists)
  try {
    const cart = await getCart(user.id);
    return NextResponse.json({ data: cart });
  } catch (error) {
    console.error("cart GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/cart
 *
 * Add an item to the cart. Server-fetches product price and recomputes
 * unitPrice — never trusts a client-supplied price.
 * For customRequestId items: verifies the CustomRequest is APPROVED
 * and belongs to the authenticated user.
 */
export async function POST(request: NextRequest) {
  // 1. Authenticate
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Look up User by clerkId
  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Validate body
  const body = await request.json().catch(() => null);
  const parsed = AddToCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  // 4. If customRequestId is provided, verify it's APPROVED and belongs to user
  if (parsed.data.customRequestId) {
    const customRequest = await prisma.customRequest.findFirst({
      where: {
        id: parsed.data.customRequestId,
        userId: user.id,
        status: "APPROVED",
      },
      select: { id: true },
    });
    if (!customRequest) {
      return NextResponse.json(
        { error: "Custom request not found, not approved, or not yours" },
        { status: 400 }
      );
    }
  }

  // 5. Add item via DAL
  try {
    const item = await addCartItem(user.id, {
      productId: parsed.data.productId,
      variantId: parsed.data.variantId ?? null,
      quantity: parsed.data.quantity,
      customizations: (parsed.data.customization ?? {}) as Record<string, unknown>,
      customRequestId: parsed.data.customRequestId ?? null,
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const knownClientErrors = [
        "Product not found or inactive",
        "Custom request not found, not approved, or not yours",
      ];
      if (knownClientErrors.some((msg) => error.message.includes(msg))) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    console.error("cart POST error:", error instanceof Error ? error.message : error, error instanceof Error ? error.stack : "");
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}