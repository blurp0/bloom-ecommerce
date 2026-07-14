import { NextRequest } from "next/server";
import { resolveProposalHandler } from "../resolveProposal";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  void request;
  const { id: customRequestId } = await context.params;
  return resolveProposalHandler(customRequestId, "REJECTED");
}
