import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import { ProposalView } from "@/features/customization/components";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProposalStatus } from "@/features/customization/types";

export const metadata: Metadata = {
  title: "Proposal | Bloom & Bind",
};

function formatEmptyState() {
  return (
    <Card className="border-interactive/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Proposal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your proposal is not ready yet. Please check back later.
          </p>
        </div>
        <Badge variant="outline">PENDING</Badge>
      </div>

      <div className="mt-6 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
        Pending Review
      </div>
    </Card>
  );
}

export default async function CustomRequestProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const clerkUserId = session?.userId;
  if (!clerkUserId) notFound();

  const requestId = params.id;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });

  if (!user) notFound();

  const customRequest = await prisma.customRequest.findFirst({
    where: { id: requestId, userId: user.id },
    select: {
      id: true,
      status: true,
      proposal: {
        select: {
          id: true,
          designConcept: true,
          price: true,
          estimatedDelivery: true,
          status: true,
        },
      },
    },
  });

  if (!customRequest) notFound();

  if (!customRequest.proposal) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">{formatEmptyState()}</div>
    );
  }

  const proposal = customRequest.proposal;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <ProposalView
        proposalId={proposal.id}
        customRequestId={customRequest.id}
        designConcept={proposal.designConcept}
        price={proposal.price.toString()}
        estimatedDelivery={proposal.estimatedDelivery}
        status={proposal.status as ProposalStatus}
      />
    </div>
  );
}
