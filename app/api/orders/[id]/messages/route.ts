import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getMessages, createMessage } from "@/lib/dal/message";
import { SendMessageSchema } from "@/lib/validators/message";
import { rateLimit } from "@/lib/rate-limit";
import { ablyServer } from "@/lib/ably/server";

/**
 * GET /api/orders/[orderId]/messages
 *
 * Fetch paginated messages for an order.
 * Authenticated. Ownership-scoped (own order or SELLER role).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;
  const searchParams = _request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50") || 50));

  try {
    const result = await getMessages(userId, orderId, page, limit);
    return NextResponse.json({
      data: {
        messages: result.messages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total: result.total,
          hasMore: result.hasMore,
        },
      },
    });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "403") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (code === "404") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("GET /api/orders/[id]/messages error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/orders/[orderId]/messages
 *
 * Create a message on an order.
 * Authenticated. Ownership-scoped. Rate-limited: 10 msgs/min per user.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 messages per minute per user (shared across all orders)
  const rl = rateLimit(`messages:post:${userId}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "You're sending too fast — wait a moment" },
      { status: 429 },
    );
  }

  const { id: orderId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const message = await createMessage(userId, orderId, parsed.data.text);

    // Publish to Ably after successful DB write.
    // Publish failure logs but does not fail the request — DB write already succeeded.
    try {
      const channel = ablyServer.channels.get(`order:${orderId}`);
      await channel.publish("message-posted", {
        messageId: message.id,
        senderId: message.senderId,
        senderName: message.senderName,
        senderRole: message.senderRole,
        text: message.text,
        createdAt: message.createdAt.toISOString(),
      });
    } catch (pubErr) {
      console.error("Ably publish failed (non-fatal):", pubErr);
    }

    return NextResponse.json(
      {
        data: {
          id: message.id,
          orderId: message.orderId,
          senderId: message.senderId,
          senderName: message.senderName,
          senderRole: message.senderRole,
          text: message.text,
          createdAt: message.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "403") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (code === "404") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("POST /api/orders/[id]/messages error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}