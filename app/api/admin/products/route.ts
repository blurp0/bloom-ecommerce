import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin/auth";
import { AdminProductQuerySchema, AdminCreateProductSchema } from "@/lib/validators/product";
import { getProductsAdmin, createProduct } from "@/lib/dal/product";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/admin/products
 * List products with pagination, search, sort.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminRole();
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "401") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = AdminProductQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const result = await getProductsAdmin(parsed.data);
  return NextResponse.json({ data: result });
}

/**
 * POST /api/admin/products
 * Create a new product.
 */
export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireAdminRole();
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "401") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = rateLimit(`admin:products:create:${user.id}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AdminCreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err) {
    console.error("Failed to create product:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
