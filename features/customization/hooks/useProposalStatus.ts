"use client";

import { useState } from "react";
import type { ProposalStatus } from "@/features/customization/types";

async function updateProposalStatus(endpoint: string) {
  const res = await fetch(endpoint, { method: "PUT" });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error || "Request failed";
    throw new Error(msg);
  }
  return json as { data?: { status?: ProposalStatus } };
}

/**
 * Hook for approving/rejecting a proposal.
 *
 * Manages loading state (`isWorking`), error state, and the current
 * `ProposalStatus`. Returns `handleApprove` and `handleReject` callbacks
 * that call the respective API endpoints.
 */
export function useProposalStatus(customRequestId: string, initialStatus: ProposalStatus) {
  const [status, setStatus] = useState<ProposalStatus>(initialStatus);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAct = status === "PENDING";

  async function handleApprove() {
    setIsWorking(true);
    setError(null);
    try {
      const json = await updateProposalStatus(`/api/custom-requests/${customRequestId}/proposal/approve`);
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
      const json = await updateProposalStatus(`/api/custom-requests/${customRequestId}/proposal/reject`);
      const next = json?.data?.status;
      if (next) setStatus(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject proposal");
    } finally {
      setIsWorking(false);
    }
  }

  return { status, isWorking, error, canAct, handleApprove, handleReject };
}