import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

  // 2. Fetch cart (DAL handles clerk→userId resolution, upserts if none exists)
  try {
    const cart = await getCart(session.userId);
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
 * DAL handles: clerk→userId resolution, customRequestId verification,
 * price computation server-side.
 */
export async function POST(request: NextRequest) {
  // 1. Authenticate
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  const body = await request.json().catch(() => null);
  const parsed = AddToCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  // 3. Add item via DAL (handles customRequestId verification + price computation)
  try {
    const item = await addCartItem(session.userId, {
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