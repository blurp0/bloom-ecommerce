import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk/roles";

export async function GET() {
  try {
    await requireRole("SELLER");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "401") return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ stats: "ok" });
}
