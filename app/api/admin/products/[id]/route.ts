import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin/auth";
import { AdminUpdateProductSchema } from "@/lib/validators/product";
import { getProductByIdAdmin, updateProduct, deleteProduct } from "@/lib/dal/product";

/**
 * GET /api/admin/products/[id]
 * Get a single product for edit form.
 */
export async function GET(
  _request: NextRequest,
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
  const product = await getProductByIdAdmin(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}

/**
 * PUT /api/admin/products/[id]
 * Update an existing product.
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

  const parsed = AdminUpdateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  try {
    const product = await updateProduct(id, parsed.data);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: product });
  } catch (err) {
    console.error("Failed to update product:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Permanently delete a product.
 */
export async function DELETE(
  _request: NextRequest,
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
  const deleted = await deleteProduct(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: { id } });
}
