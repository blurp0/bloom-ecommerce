import { prisma } from "@/lib/prisma/client";
import type { Role } from "@prisma/client";

// ── Types ─────────────────────────────────────────────

export interface MessageResult {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  createdAt: Date;
}

export interface PaginatedMessages {
  messages: MessageResult[];
  total: number;
  hasMore: boolean;
}

// ── Resolver (shared with order DAL pattern) ──────────

async function resolveUserId(clerkId: string): Promise<string> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1
  `;
  if (!rows[0]) throw new Error("User not found");
  return rows[0].id;
}

// ── Helpers ───────────────────────────────────────────

function toMessageResult(row: {
  id: string;
  orderId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: { id: string; name: string | null; role: Role };
}): MessageResult {
  return {
    id: row.id,
    orderId: row.orderId,
    senderId: row.senderId,
    senderName: row.sender.name ?? "Unknown",
    senderRole: row.sender.role,
    text: row.content, // DB "content" → API "text"
    createdAt: row.createdAt,
  };
}

// ── Exports ───────────────────────────────────────────

/**
 * Fetch paginated messages for an order.
 *
 * Ownership: user must own the order or have SELLER role (throws 403).
 * Order must exist (throws 404).
 * Messages ordered oldest-first (createdAt ASC).
 */
export async function getMessages(
  clerkId: string,
  orderId: string,
  page: number,
  limit: number,
): Promise<PaginatedMessages> {
  const userId = await resolveUserId(clerkId);

  // Fetch order + user role to check ownership in one query
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) {
    const err = new Error("User not found");
    (err as NodeJS.ErrnoException).code = "404";
    throw err;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });

  if (!order) {
    const err = new Error("Order not found");
    (err as NodeJS.ErrnoException).code = "404";
    throw err;
  }

  // Ownership: own order OR seller
  if (order.userId !== userId && user.role !== "SELLER") {
    const err = new Error("Forbidden");
    (err as NodeJS.ErrnoException).code = "403";
    throw err;
  }

  const skip = (page - 1) * limit;

  const rows = await prisma.message.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
    skip,
    take: limit,
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
  });
  const total = await prisma.message.count({ where: { orderId } });

  // ponytail: Accelerate $extends strips Prisma include inference, cast is safe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = rows.map((row: any) => toMessageResult(row as any));

  return {
    messages,
    total,
    hasMore: page * limit < total,
  };
}

/**
 * Create a message on an order.
 *
 * Ownership: user must own the order or have SELLER role (throws 403).
 * Order must exist (throws 404).
 * Returns the created message with sender info populated.
 */
export async function createMessage(
  clerkId: string,
  orderId: string,
  text: string,
): Promise<MessageResult> {
  const userId = await resolveUserId(clerkId);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) {
    const err = new Error("User not found");
    (err as NodeJS.ErrnoException).code = "404";
    throw err;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });

  if (!order) {
    const err = new Error("Order not found");
    (err as NodeJS.ErrnoException).code = "404";
    throw err;
  }

  if (order.userId !== userId && user.role !== "SELLER") {
    const err = new Error("Forbidden");
    (err as NodeJS.ErrnoException).code = "403";
    throw err;
  }

  const message = await prisma.message.create({
    data: {
      orderId,
      senderId: userId,
      content: text.trim(),
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
  });

  return toMessageResult(message);
}

// ── Conversations ─────────────────────────────────────

export interface ConversationResult {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  /** First product name(s) for display label — "Rose Bouquet" or "Rose Bouquet & 2 more" */
  itemLabel: string;
  lastMessage: {
    text: string;
    senderRole: Role;
    createdAt: string;
  } | null;
  messageCount: number;
}

/**
 * Get all order conversations for a user.
 *
 * Customer: only orders they own that have messages.
 * Seller: all orders that have messages.
 * Sorted by most recent message descending.
 *
 * ponytail: raw SQL avoids N+1 — joins Order + Message in one query per order.
 * Second query fetches item names for each order (single IN query, not per-order).
 * Upgrade path: move to pagination when user exceeds ~100 conversations.
 */
export async function getConversations(
  clerkId: string,
): Promise<ConversationResult[]> {
  const userId = await resolveUserId(clerkId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) {
    const err = new Error("User not found");
    (err as NodeJS.ErrnoException).code = "404";
    throw err;
  }

  const isSeller = user.role === "SELLER";

  const whereClause = isSeller ? "" : `WHERE o."userId" = '${userId}'`;

  const rows = await prisma.$queryRawUnsafe<
    {
      orderId: string;
      orderNumber: string;
      orderStatus: string;
      lastMessageText: string | null;
      lastMessageRole: Role | null;
      lastMessageCreatedAt: Date | null;
      messageCount: bigint;
    }[]
  >(`
    SELECT
      o."id" AS "orderId",
      o."orderNumber" AS "orderNumber",
      o."status" AS "orderStatus",
      lm."content" AS "lastMessageText",
      lm_sender."role" AS "lastMessageRole",
      lm."createdAt" AS "lastMessageCreatedAt",
      COUNT(m."id") AS "messageCount"
    FROM "Order" o
    JOIN "Message" m ON m."orderId" = o."id"
    LEFT JOIN LATERAL (
      SELECT "content", "senderId", "createdAt"
      FROM "Message"
      WHERE "orderId" = o."id"
      ORDER BY "createdAt" DESC
      LIMIT 1
    ) lm ON true
    LEFT JOIN "User" lm_sender ON lm_sender."id" = lm."senderId"
    ${whereClause}
    GROUP BY o."id", o."orderNumber", o."status", lm."content", lm_sender."role", lm."createdAt"
    ORDER BY lm."createdAt" DESC NULLS LAST
  `);

  // Fetch item names for all conversation orders in one query (no N+1)
  const orderIds = rows.map((r) => r.orderId);
  let itemLabels: Record<string, string> = {};

  if (orderIds.length > 0) {
    const items = await prisma.$queryRawUnsafe<
      { orderId: string; productName: string }[]
    >(`
      SELECT oi."orderId", p."name" AS "productName"
      FROM "OrderItem" oi
      JOIN "Product" p ON p."id" = oi."productId"
      WHERE oi."orderId" IN (${orderIds.map((id) => `'${id}'`).join(",")})
      ORDER BY oi."orderId"
    `);

    const byOrder: Record<string, string[]> = {};
    for (const item of items) {
      (byOrder[item.orderId] ??= []).push(item.productName);
    }
    for (const [oid, names] of Object.entries(byOrder)) {
      itemLabels[oid] =
        names.length === 1
          ? names[0]
          : `${names[0]} & ${names.length - 1} more`;
    }
  }

  return rows.map((row) => ({
    orderId: row.orderId,
    orderNumber: row.orderNumber,
    orderStatus: row.orderStatus,
    itemLabel: itemLabels[row.orderId] ?? row.orderNumber,
    lastMessage: row.lastMessageText
      ? {
          text:
            row.lastMessageText.length > 60
              ? row.lastMessageText.slice(0, 60) + "…"
              : row.lastMessageText,
          senderRole: row.lastMessageRole ?? "CUSTOMER",
          createdAt: row.lastMessageCreatedAt!.toISOString(),
        }
      : null,
    messageCount: Number(row.messageCount),
  }));
}