"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Shield, User } from "lucide-react";
import MessageThread from "@/features/order/components/MessageThread";
import MessageInput from "@/features/order/components/MessageInput";

/**
 * Dev-only demo page for testing MessageThread + MessageInput with both roles.
 *
 * Usage: /dev/message-demo/{orderId}?role=CUSTOMER or ?role=SELLER
 * Requires auth (Clerk) — must be signed in.
 * Uses a toggle at top for switching perspective between Customer and Seller.
 */
export default function MessageDemoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;

  const initialRole =
    (searchParams.get("role")?.toUpperCase() === "SELLER"
      ? "SELLER"
      : "CUSTOMER") as "CUSTOMER" | "SELLER";

  const [role, setRole] = useState<"CUSTOMER" | "SELLER">(initialRole);

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Message Demo
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Order: <code className="font-mono">{orderId}</code>
        </p>
      </div>

      {/* Role toggle */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-medium text-[var(--text-muted)]">
          View as:
        </span>
        <button
          type="button"
          onClick={() =>
            setRole((r) => (r === "CUSTOMER" ? "SELLER" : "CUSTOMER"))
          }
          className={[
            "inline-flex items-center gap-1.5 rounded-[9999px] px-3 py-1.5 text-xs font-semibold border transition-all duration-200",
            role === "CUSTOMER"
              ? "bg-[var(--accent-primary)]/15 border-[var(--accent-primary)] text-[var(--accent-primary-foreground)]"
              : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]",
          ].join(" ")}
        >
          {role === "CUSTOMER" ? (
            <>
              <User className="h-3.5 w-3.5" />
              Customer
            </>
          ) : (
            <>
              <Shield className="h-3.5 w-3.5" />
              Seller
            </>
          )}
        </button>
      </div>

      {/* Thread */}
      <div className="flex flex-col gap-3">
        <MessageThread orderId={orderId} currentUserRole={role} />
        <MessageInput orderId={orderId} currentUserRole={role} />
      </div>
    </div>
  );
}