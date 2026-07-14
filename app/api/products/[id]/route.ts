import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/dal/product";

/**
 * GET /api/products/[id]
 *
 * Retrieves detailed information for a single product by ID.
 * Returns 404 if the product is not found or is inactive.
 * Public endpoint — no authentication required.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("[products/id] Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}