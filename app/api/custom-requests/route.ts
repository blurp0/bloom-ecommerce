import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/clerk/roles";
import { CreateCustomRequestSchema } from "@/lib/validators/custom-request";
import type { CustomRequestStatus, Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  // 1. Authenticate Clerk session
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body using schema (strictObject / reject unknown keys) — use as-is
  const body = await request.json().catch(() => null);
  const parsed = CreateCustomRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  // 3. Look up User by clerkId
  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Create CustomRequest row
  const created = await prisma.customRequest.create({
    data: {
      userId: user.id,
      flowers: parsed.data.flowers,
      colors: parsed.data.colors,
      size: parsed.data.size,
      occasion: parsed.data.occasion ?? null,
      budget: parsed.data.budget ?? null,
      instructions: parsed.data.instructions ?? null,
      referenceImages: parsed.data.referenceImages ?? [],
      status: "PENDING" as CustomRequestStatus,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ data: created }, { status: 201 });
}

export async function GET(request: NextRequest) {
  // 1. Authenticate Clerk session
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Seller: require role inside handler
  if (user.role === "SELLER") {
    await requireRole("SELLER" satisfies Role);
    const requests = await prisma.customRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: { requests } });
  }

  // Customer: ownership-scoped query (DAL pattern)
  const requests = await prisma.customRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: { requests } });
}
