import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { resolveProposal } from "@/lib/dal/custom-request";

export async function resolveProposalHandler(
  customRequestId: string,
  nextStatus: "APPROVED" | "REJECTED"
): Promise<NextResponse> {
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await resolveProposal(session.userId, customRequestId, nextStatus);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    const error = err as NodeJS.ErrnoException & { code?: string };

    if (error.code === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (error.code === "CONFLICT") {
      return NextResponse.json(
        { error: "Request is not in a proposable state" },
        { status: 409 }
      );
    }

    if (error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("[resolveProposal] Failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}