"use client";

import { MessageSquare } from "lucide-react";
import { useCustomizationStore, MESSAGE_CARD_MAX_CHARS } from "@/features/customization/store";

const MAX_CHARS = MESSAGE_CARD_MAX_CHARS;

/**
 * MessageCardInput — textarea with live character counter and
 * live preview card showing the typed text. Updates the store
 * via `setMessageCardText` which silently truncates at 200 chars.
 */
export default function MessageCardInput() {
  const { messageCardText, setMessageCardText } = useCustomizationStore();
  const remaining = MAX_CHARS - messageCardText.length;
  const isNearLimit = remaining <= 20;
  const isAtLimit = remaining === 0;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--text-muted)]">
        Add a personal message to include with your bouquet. Optional — leave blank if
        not needed.
      </p>

      {/* Textarea */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message-card"
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          Message Card
        </label>
        <textarea
          id="message-card"
          value={messageCardText}
          onChange={(e) => setMessageCardText(e.target.value)}
          placeholder="Write your message here..."
          maxLength={MAX_CHARS}
          rows={4}
          className={[
            "w-full rounded-[12px] border-2 p-3 text-base resize-none",
            "bg-[var(--bg-surface)] text-[var(--text-primary)]",
            "placeholder:text-[var(--text-muted)] placeholder:text-sm",
            "border-[var(--border-interactive)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
            "transition-colors duration-150",
          ].join(" ")}
          aria-describedby="message-card-counter"
        />
        <div
          id="message-card-counter"
          className={[
            "flex items-center justify-end gap-1 text-xs",
            isAtLimit
              ? "text-[var(--state-error)]"
              : isNearLimit
                ? "text-[var(--state-warning)]"
                : "text-[var(--text-muted)]",
          ].join(" ")}
        >
          <span>{messageCardText.length}</span>
          <span aria-hidden="true">/</span>
          <span>{MAX_CHARS}</span>
          {isAtLimit && (
            <span className="ml-1 font-medium">(Max reached)</span>
          )}
        </div>
      </div>

      {/* Live Preview Card */}
      {messageCardText.trim() ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Preview
          </span>
          <div
            className={[
              "rounded-[16px] border border-[var(--border-default)] p-4",
              "bg-[var(--bg-elevated)] min-h-[80px]",
              "flex flex-col items-center justify-center text-center",
            ].join(" ")}
          >
            <MessageSquare className="h-5 w-5 text-[var(--accent-primary)] mb-2" aria-hidden="true" />
            <p className="text-sm text-[var(--text-primary)] italic leading-relaxed max-w-sm">
              &ldquo;{messageCardText}&rdquo;
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--text-muted)]">Preview</span>
          <div
            className={[
              "rounded-[16px] border border-dashed border-[var(--border-default)] p-4",
              "bg-[var(--bg-surface)] min-h-[80px]",
              "flex items-center justify-center",
            ].join(" ")}
          >
            <p className="text-sm text-[var(--text-muted)]">
              Your message preview will appear here...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}