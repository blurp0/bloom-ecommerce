import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UploadParamsSchema } from "@/lib/validators/upload";
import { generateUploadSignature } from "@/lib/cloudinary/upload";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { cloudinary } from "@/lib/cloudinary/client";

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

export async function POST(request: NextRequest) {
  // 0. Rate limit — 10 requests per 60 s per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`uploads/image:post:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    const retryAfterSeconds = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  // 1. Authenticate the Clerk session
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse query parameters
  const { searchParams } = new URL(request.url);
  const folderParam = searchParams.get("folder") ?? "custom-requests";

  // 3. Validate parameter using Zod UploadParamsSchema
  const result = UploadParamsSchema.safeParse({ folder: folderParam });
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const { folder } = result.data;

  // 4. Parse multipart form
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const contentType = file.type || "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  const maxBytes = 5 * 1024 * 1024; // 5MB per spec
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Each image must be 5MB or less" }, { status: 400 });
  }

  // 5. Upload to Cloudinary server-side
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Keep folder consistent with signature generation
    generateUploadSignature(folder);

    const uploadRes = await new Promise<{ secure_url: string; [k: string]: unknown }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as any);
          }
        );
        uploadStream.end(buffer);
      }
    );

    if (!uploadRes?.secure_url) {
      return NextResponse.json({ error: "Cloudinary returned no image URL" }, { status: 500 });
    }

    return NextResponse.json({ url: uploadRes.secure_url }, { status: 200 });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Cloudinary image upload failed" }, { status: 500 });
  }
}
