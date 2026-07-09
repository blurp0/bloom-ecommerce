import { NextRequest } from "next/server";
import { resolveProposal } from "../resolveProposal";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  void request;
  const { id: customRequestId } = await context.params;
  return resolveProposal(customRequestId, "APPROVED");
}
