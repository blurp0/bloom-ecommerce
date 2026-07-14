import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UpdateCartItemSchema } from "@/lib/validators/cart";
import { updateCartItem, removeCartItem } from "@/lib/dal/cart";

/**
 * PUT /api/cart/[itemId]
 *
 * Update the quantity of a cart item. Only accepts `quantity`.
 * Ownership is scoped in the DAL query — returns 404 if item not
 * found or does not belong to the authenticated user.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;

  // 1. Authenticate
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body — only quantity is accepted
  const body = await request.json().catch(() => null);
  const parsed = UpdateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  // 3. Update via DAL (handles clerk→userId resolution + ownership in query)
  try {
    const updated = await updateCartItem(session.userId, itemId, parsed.data.quantity);
    if (!updated) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("cart PUT error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart/[itemId]
 *
 * Remove a single item from the cart.
 * Ownership is scoped in the DAL query — returns 404 if item not
 * found or does not belong to the authenticated user.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;

  // 1. Authenticate
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Remove via DAL (handles clerk→userId resolution + ownership in query)
  try {
    const removed = await removeCartItem(session.userId, itemId);
    if (!removed) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { removed: true } });
  } catch (error) {
    console.error("cart DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}