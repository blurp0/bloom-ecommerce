import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin/auth";
import { cloudinary } from "@/lib/cloudinary/client";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/admin/uploads/library
 *
 * Fetch existing product images from Cloudinary media library.
 * Returns paginated list of image URLs and public IDs.
 * Admin-only.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(`admin:uploads:library:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    const retryAfterSeconds = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  try {
    await requireAdminRole();
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "401") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const nextCursor = searchParams.get("next_cursor") || undefined;

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "products/",
      max_results: 50,
      next_cursor: nextCursor,
    });

    const images = result.resources.map((res: { secure_url: string; public_id: string; created_at: string }) => ({
      url: res.secure_url,
      publicId: res.public_id,
      createdAt: res.created_at,
    }));

    return NextResponse.json({ data: images, next_cursor: result.next_cursor || null });
  } catch (error) {
    console.error("Cloudinary library fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch library assets" }, { status: 500 });
  }
}
