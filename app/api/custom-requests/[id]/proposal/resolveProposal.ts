import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import type { CustomRequestStatus, ProposalStatus } from "@prisma/client";

export async function resolveProposal(
  customRequestId: string,
  nextStatus: "APPROVED" | "REJECTED"
): Promise<NextResponse> {
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: session.userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customRequest = await tx.customRequest.findFirst({
        where: { id: customRequestId, userId: user.id },
        select: {
          id: true,
          status: true,
          proposal: { select: { id: true } },
        },
      });

      if (!customRequest) {
        return { ok: false as const, statusCode: 403 as const };
      }

      if (customRequest.status !== "PROPOSED") {
        return { ok: false as const, statusCode: 409 as const };
      }

      if (!customRequest.proposal) {
        return { ok: false as const, statusCode: 409 as const };
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

      return { ok: true as const, statusCode: 200 as const };
    });

    if (!result.ok) {
      if (result.statusCode === 409) {
        return NextResponse.json(
          { error: "Request is not in a proposable state" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: { status: nextStatus } }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
