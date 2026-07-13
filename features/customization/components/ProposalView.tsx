"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { formatDate } from "@/lib/date";

type ProposalStatus = "PENDING" | "APPROVED" | "REJECTED";

function formatPhp(amount: number | string) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "₱0.00";
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);
}

function statusBadgeVariant(status: ProposalStatus) {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "PENDING":
    default:
      return "outline";
  }
}

async function updateProposalStatus(endpoint: string) {
  const res = await fetch(endpoint, { method: "PUT" });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error || "Request failed";
    throw new Error(msg);
  }
  return json as { data?: { status?: ProposalStatus } };
}

export type ProposalViewProps = {
  proposalId: string;
  customRequestId: string;
  designConcept: string;
  price: number | string;
  estimatedDelivery: string | Date;
  status: ProposalStatus;
};

export function ProposalView(props: ProposalViewProps) {
  const [status, setStatus] = useState<ProposalStatus>(props.status);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAct = status === "PENDING";

  const approveEndpoint = `/api/custom-requests/${props.customRequestId}/proposal/approve`;
  const rejectEndpoint = `/api/custom-requests/${props.customRequestId}/proposal/reject`;

  async function handleApprove() {
    setIsWorking(true);
    setError(null);
    try {
      const json = await updateProposalStatus(approveEndpoint);
      const next = json?.data?.status;
      if (next) setStatus(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve proposal");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleReject() {
    setIsWorking(true);
    setError(null);
    try {
      const json = await updateProposalStatus(rejectEndpoint);
      const next = json?.data?.status;
      if (next) setStatus(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject proposal");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <Card className="border-interactive/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Proposal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review the design concept and decide whether to approve or reject.
          </p>
        </div>

        <Badge variant={statusBadgeVariant(status)}>{status}</Badge>
      </div>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Design concept</h2>
          <p className="text-base">{props.designConcept}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Proposed price</h2>
            <p className="text-xl font-semibold">{formatPhp(props.price)}</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Estimated delivery</h2>
            <p className="text-base">{formatDate(props.estimatedDelivery)}</p>
          </div>
        </div>

        {status === "REJECTED" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Rejected — awaiting seller revision
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          {canAct && (
            <>
              <Dialog>
                <DialogTrigger>
                  <Button disabled={isWorking} variant="default">
                    Approve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve this proposal?</DialogTitle>
                    <DialogDescription>
                      Approving will mark your request as approved and enable adding the custom request item to cart later.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" disabled={isWorking} />}>
                      Cancel
                    </DialogClose>
                    <Button type="button" disabled={isWorking} onClick={handleApprove}>
                      {isWorking ? "Approving..." : "Confirm Approve"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger>
                  <Button disabled={isWorking} variant="destructive">
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject this proposal?</DialogTitle>
                    <DialogDescription>
                      Rejecting will mark your request as rejected and require a new seller proposal.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" disabled={isWorking} />}>
                      Cancel
                    </DialogClose>
                    <Button type="button" disabled={isWorking} onClick={handleReject}>
                      {isWorking ? "Rejecting..." : "Confirm Reject"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {status === "APPROVED" ? (
          <Button
            disabled
            variant="secondary"
            className="pointer-events-none"
            title="Coming soon"
          >
            Add to Cart
          </Button>
        ) : (
          <Button disabled variant="secondary">
            Add to Cart
          </Button>
        )}
      </div>
    </Card>
  );
}
