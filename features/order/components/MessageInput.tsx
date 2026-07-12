"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMessages, type Message } from "@/features/order/hooks/useMessages";

// ── Props ──────────────────────────────────────────────

interface MessageInputProps {
  orderId: string;
  currentUserRole: "CUSTOMER" | "SELLER";
  onMessageSent?: (message: Message) => void;
  disabled?: boolean;
}

const MAX_LENGTH = 500;
const WARNING_THRESHOLD = 351;
const CRITICAL_THRESHOLD = 476;
const RATE_LIMIT_COOLDOWN = 10_000; // 10 seconds

// ── Character Counter ──────────────────────────────────

function CharCounter({ count }: { count: number }) {
  let colorClass = "text-[var(--text-muted)]";
  if (count >= CRITICAL_THRESHOLD) {
    colorClass = "text-[var(--state-error)]";
  } else if (count >= WARNING_THRESHOLD) {
    colorClass = "text-[var(--state-warning)]";
  }

  const ariaLabel =
    count >= CRITICAL_THRESHOLD
      ? `${count} of ${MAX_LENGTH} characters — near limit`
      : `${count} / ${MAX_LENGTH}`;

  return (
    <span
      className={["text-xs font-medium", colorClass].join(" ")}
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {count} / {MAX_LENGTH}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────

/**
 * MessageInput — textarea + send button for order messages.
 *
 * - Auto-expands textarea 2→4 rows → scroll beyond.
 * - Character counter with color thresholds (neutral / warning / critical).
 * - Rate-limit handling: disables input for 10s on 429.
 * - Sends via `POST /api/orders/[orderId]/messages`.
 */
export default function MessageInput({
  orderId,
  currentUserRole,
  onMessageSent,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rateLimitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sendMessage, isSending, sendError } = useMessages(orderId);

  const trimmedIsEmpty = text.trim().length === 0;
  const isDisabled = disabled || isSending || isRateLimited;

  // ── Rate limit countdown ────────────────────────────
  useEffect(() => {
    if (rateLimitTimer <= 0) return;
    const interval = setInterval(() => {
      setRateLimitTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitTimer]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (rateLimitTimeoutRef.current) {
        clearTimeout(rateLimitTimeoutRef.current);
      }
    };
  }, []);

  // ── Auto-expand textarea ─────────────────────────────
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // Clamp between 2 rows (~48px) and 4 rows max (~150px) then scroll
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  // ── Send ─────────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isDisabled) return;

    try {
      const message = await sendMessage(trimmed);
      setText("");
      textareaRef.current?.focus();
      onMessageSent?.(message);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;

      if (code === "429") {
        // Rate-limited
        setIsRateLimited(true);
        setRateLimitTimer(10);
        toast.error("You're sending too fast — wait a moment");

        rateLimitTimeoutRef.current = setTimeout(() => {
          setIsRateLimited(false);
        }, RATE_LIMIT_COOLDOWN);
      } else if (code === "400") {
        toast.error("Message must be 1–500 characters");
      } else if (code === "401" || code === "403" || code === "404") {
        toast.error("You don't have access to this order");
      } else {
        toast.error("Something went wrong — please try again");
      }
    }
  };

  // ── Keyboard: Enter to send, Shift+Enter for newline ─
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Re-focus on send-error resolution ────────────────
  // (No action needed — toast handles feedback)

  const placeholder =
    currentUserRole === "SELLER"
      ? "Reply to customer..."
      : "Type a message...";

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label + counter */}
      <div className="flex items-center justify-between px-1">
        <label
          htmlFor="message-input"
          className="text-xs font-medium text-[var(--text-muted)]"
        >
          {currentUserRole === "SELLER" ? "Reply" : "Message"}
        </label>
        <CharCounter count={text.length} />
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          id="message-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={MAX_LENGTH}
          rows={2}
          disabled={isDisabled}
          className={[
            "flex-1 rounded-[12px] border border-[var(--border-interactive)] bg-[var(--bg-surface)]",
            "px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
            "resize-none outline-none",
            "focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:border-[var(--accent-primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
          ].join(" ")}
          style={{ minHeight: "44px" }}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isDisabled || trimmedIsEmpty}
          aria-label={
            isRateLimited
              ? "Rate limited — wait before sending"
              : "Send message"
          }
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]",
            "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
            "hover:bg-[var(--accent-primary-hover)] active:scale-95",
            "transition-all duration-200 ease-out",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
          ].join(" ")}
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Rate limit notice */}
      {isRateLimited && rateLimitTimer > 0 && (
        <p className="px-1 text-[11px] text-[var(--state-error)]">
          You&apos;re sending too fast — wait {rateLimitTimer}s
        </p>
      )}

      {/* Inline send error (non-429, non-toast errors) */}
      {sendError &&
        (sendError as NodeJS.ErrnoException).code !== "429" &&
        (sendError as NodeJS.ErrnoException).code !== "400" &&
        (sendError as NodeJS.ErrnoException).code !== "401" &&
        (sendError as NodeJS.ErrnoException).code !== "403" &&
        (sendError as NodeJS.ErrnoException).code !== "404" && (
          <p className="px-1 text-[11px] text-[var(--state-error)]">
            Something went wrong — please try again
          </p>
        )}
    </div>
  );
}