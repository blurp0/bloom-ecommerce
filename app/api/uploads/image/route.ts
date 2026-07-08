import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UploadParamsSchema } from "@/lib/validators/upload";
import { generateUploadSignature } from "@/lib/cloudinary/upload";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // 0. Rate limit — 10 requests per 60 s per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`uploads/image:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    const retryAfterSeconds = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  // 1. Authenticate the Clerk session
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse query parameters
  const { searchParams } = new URL(request.url);
  const folderParam = searchParams.get("folder") ?? "products";

  // 3. Validate parameter using Zod UploadParamsSchema
  const result = UploadParamsSchema.safeParse({ folder: folderParam });
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const { folder } = result.data;

  // 4. Generate signature
  try {
    const uploadParams = generateUploadSignature(folder);
    return NextResponse.json(uploadParams);
  } catch (error) {
    console.error("Error generating Cloudinary upload signature:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
