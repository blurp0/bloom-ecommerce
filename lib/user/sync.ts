import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";

export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    create: { clerkId: clerkUser.id, email, name },
    update: { email, name },
  });
}
