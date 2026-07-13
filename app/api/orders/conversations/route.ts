import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConversations } from "@/lib/dal/message";

/**
 * GET /api/orders/conversations
 *
 * Returns all order conversations for the authenticated user.
 * Customer: only orders they own with messages.
 * Seller: all orders with messages.
 * Sorted by most recent message descending. No pagination (MVP scope).
 */
export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await getConversations(userId);
    return NextResponse.json({ data: { conversations } });
  } catch (err) {
    console.error("GET /api/orders/conversations error:", err);
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "404") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}