import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";
import { type CreateCustomRequestInput } from "@/lib/validators/custom-request";
import type { CustomRequestStatus, ProposalStatus } from "@prisma/client";

// ── Resolver (shared DAL pattern) ──────────────────────

async function resolveUserId(clerkId: string): Promise<string> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1
  `;
  if (!rows[0]) throw new Error("User not found");
  return rows[0].id;
}

// ── Types ──────────────────────────────────────────────

export interface CustomRequestResult {
  id: string;
  status: CustomRequestStatus;
  createdAt: Date;
}

// ── Exports ────────────────────────────────────────────

/**
 * Create a custom bouquet request.
 * Requires auth — clerkId resolves to internal userId.
 */
export async function createCustomRequest(
  clerkId: string,
  data: CreateCustomRequestInput,
): Promise<CustomRequestResult> {
  const userId = await resolveUserId(clerkId);

  const created = await prisma.customRequest.create({
    data: {
      userId,
      flowers: data.flowers,
      colors: data.colors,
      size: data.size,
      occasion: data.occasion ?? null,
      budget: data.budget ?? null,
      instructions: data.instructions ?? null,
      referenceImages: data.referenceImages ?? [],
      status: "PENDING" as CustomRequestStatus,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  return created;
}

/**
 * Get custom requests for a user.
 * ClerkId determines role: SELLER sees all, CUSTOMER sees only their own.
 */
export async function getCustomRequests(clerkId: string) {
  const userId = await resolveUserId(clerkId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) throw new Error("User not found");

  if (user.role === "SELLER") {
    return prisma.customRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.customRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Resolve a proposal (approve or reject).
 * Ownership: user must own the custom request.
 * Guard: request must be in PROPOSED status.
 * Returns the new status, or throws with code for error mapping.
 */
export async function resolveProposal(
  clerkId: string,
  customRequestId: string,
  nextStatus: "APPROVED" | "REJECTED",
): Promise<{ status: CustomRequestStatus }> {
  const userId = await resolveUserId(clerkId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customRequest = await tx.customRequest.findFirst({
        where: { id: customRequestId, userId },
        select: {
          id: true,
          status: true,
          proposal: { select: { id: true } },
        },
      });

      if (!customRequest) {
        throw Object.assign(new Error("Forbidden"), { code: "FORBIDDEN" });
      }

      if (customRequest.status !== "PROPOSED") {
        throw Object.assign(new Error("Request is not in a proposable state"), { code: "CONFLICT" });
      }

      if (!customRequest.proposal) {
        throw Object.assign(new Error("Request is not in a proposable state"), { code: "CONFLICT" });
      }

      await tx.customRequest.update({
        where: { id: customRequestId, status: "PROPOSED" },
        data: { status: nextStatus as CustomRequestStatus },
        select: { id: true },
      });

      await tx.proposal.update({
        where: { id: customRequest.proposal.id },
        data: { status: nextStatus as ProposalStatus },
      });

      return { status: nextStatus as CustomRequestStatus };
    });

    return result;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw Object.assign(new Error("Request is not in a proposable state"), { code: "CONFLICT" });
    }
    throw err;
  }
}