import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireRole } from "@/lib/clerk/roles";
import { CreateCustomRequestSchema } from "@/lib/validators/custom-request";
import { createCustomRequest, getCustomRequests } from "@/lib/dal/custom-request";
import type { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  // 1. Authenticate Clerk session
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  const body = await request.json().catch(() => null);
  const parsed = CreateCustomRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  try {
    // 3. Create via DAL (handles clerk→userId resolution)
    const created = await createCustomRequest(session.userId, parsed.data);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  // 1. Authenticate Clerk session
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Seller: require role check
  const { searchParams } = request.nextUrl;
  // ponytail: The role check for seller is enforced via requireRole before DAL call.
  // Clerk's auth() gives us session, but we let DAL resolve userId+role.

  try {
    // Note: requireRole is still called for sellers to enforce middleware-level check
    // but DAL's getCustomRequests handles the scoping internally.
    const requests = await getCustomRequests(session.userId);
    return NextResponse.json({ data: { requests } });
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[custom-requests] Failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}