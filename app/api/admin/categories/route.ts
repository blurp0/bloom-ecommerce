import { NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma/client";

/**
 * GET /api/admin/categories
 * List all categories for product form dropdown.
 */
export async function GET() {
  try {
    await requireAdminRole();
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "401") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: categories });
}
