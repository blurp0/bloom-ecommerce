import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk/roles";
import { getDashboardStats } from "@/lib/dal/dashboard";

export async function GET() {
  try {
    await requireRole("SELLER");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "401") return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("Dashboard stats fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}

