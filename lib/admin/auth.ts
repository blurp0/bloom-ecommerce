import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";

/**
 * Require SELLER role for admin-protected routes and Server Actions.
 * Throws with `code` on failure for Route Handlers; redirects for page-level checks.
 *
 * Usage in Route Handler:
 *   try { await requireAdminRole(); } catch (e) {
 *     return NextResponse.json({ error }, { status: code });
 *   }
 *
 * Usage in Server Component (layout/page):
 *   await requireAdminRole(); // redirects on failure
 *
 * Usage in Server Action:
 *   try { await requireAdminRole(); } catch (e) { return { error }; }
 */
export async function requireAdminRole(): Promise<User> {
  const { userId } = await auth();
  if (!userId) {
    const err = new Error("Unauthenticated");
    (err as NodeJS.ErrnoException).code = "401";
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  // ponytail: temp debug — remove after admin redirect is fixed
  console.log("[admin-auth]", { clerkId: userId, found: !!user, role: user?.role });

  if (!user || user.role !== "SELLER") {
    const err = new Error("Forbidden");
    (err as NodeJS.ErrnoException).code = "403";
    throw err;
  }

  return user;
}

/**
 * Server Component helper: require SELLER role, redirect non-sellers to "/".
 * Use in layouts and pages that should redirect rather than return 403 JSON.
 */
export async function requireAdminRoleOrRedirect(): Promise<User> {
  try {
    return await requireAdminRole();
  } catch {
    redirect("/");
  }
}