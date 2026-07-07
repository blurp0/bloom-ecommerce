import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import type { Role, User } from "@prisma/client";

export async function requireRole(role: Role): Promise<User> {
  const { userId } = await auth();
  if (!userId) {
    const err = new Error("Unauthenticated");
    (err as NodeJS.ErrnoException).code = "401";
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== role) {
    const err = new Error("Forbidden");
    (err as NodeJS.ErrnoException).code = "403";
    throw err;
  }

  return user;
}
