import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin/auth";
import { BulkDeleteSchema } from "@/lib/validators/product";
import { bulkDeleteProducts } from "@/lib/dal/product";

/**
 * POST /api/admin/products/bulk-delete
 * Delete multiple products at once.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminRole();
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "401") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BulkDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const count = await bulkDeleteProducts(parsed.data.ids);
  return NextResponse.json({ data: { deleted: count } });
}
