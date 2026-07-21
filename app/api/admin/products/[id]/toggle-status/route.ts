import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin/auth";
import { ToggleStatusSchema } from "@/lib/validators/product";
import { toggleProductStatus } from "@/lib/dal/product";

/**
 * PUT /api/admin/products/[id]/toggle-status
 * Toggle product isActive without full form edit.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRole();
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "401") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ToggleStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const result = await toggleProductStatus(id, parsed.data.isActive);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: result });
}
