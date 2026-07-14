import { NextRequest, NextResponse } from "next/server";
import { ProductQuerySchema } from "@/lib/validators/product";
import { getProducts } from "@/lib/dal/product";

/**
 * GET /api/products
 *
 * Lists active products matching search/filter params, returning paginated
 * results with metadata. Public endpoint — no authentication required.
 *
 * Query parameters validated via ProductQuerySchema:
 *   category, occasion, minPrice, maxPrice, search, page, limit, sort
 */
export async function GET(request: NextRequest) {
  // 1. Parse and validate query parameters
  const { searchParams } = request.nextUrl;
  const rawParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    rawParams[key] = value;
  });

  const parsed = ProductQuerySchema.safeParse(rawParams);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: `Invalid query parameter: ${firstIssue.path.join(".")} — ${firstIssue.message}`,
      },
      { status: 400 }
    );
  }

  try {
    // 2. Call DAL
    const result = await getProducts(parsed.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[products] Failed to fetch products:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}