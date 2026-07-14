"use client";

import { MessageCircle } from "lucide-react";
import { useMessageStore } from "@/features/messages/store/message-store";
import { useChatModalStore } from "@/features/messages/store/chat-modal-store";

/**
 * Fixed floating message button — visible on all shop pages.
 *
 * Click opens the FloatingMessageModal (slide-in sheet with chat hub inside).
 * Shows total unread count across all orders as a badge.
 * Position: bottom-right, above the mobile bottom tab bar.
 */
export default function FloatingMessageButton() {
  const openModal = useChatModalStore((s) => s.openModal);
  const unreadByOrder = useMessageStore((s) => s.unreadByOrder);
  const totalUnread = Object.values(unreadByOrder).reduce(
    (sum, n) => sum + n,
    0,
  );

  return (
    <button
      type="button"
      onClick={() => openModal()}
      className={[
        "fixed bottom-20 right-4 z-30 lg:bottom-6 lg:right-6",
        "flex h-14 w-14 items-center justify-center rounded-full",
        "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
        "shadow-clay-md hover:shadow-clay-lg",
        "hover:-translate-y-0.5 active:scale-95",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2",
      ].join(" ")}
      aria-label={
        totalUnread > 0
          ? `${totalUnread} unread messages — open messages`
          : "Open messages"
      }
    >
      <MessageCircle className="h-6 w-6" />
      {totalUnread > 0 && (
        <span
          className={[
            "absolute -top-1 -right-1",
            "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1",
            "bg-[var(--state-error)] text-white text-[10px] font-bold",
            "shadow-sm",
          ].join(" ")}
          aria-hidden="true"
        >
          {totalUnread > 99 ? "99+" : totalUnread}
        </span>
      )}
    </button>
  );
}