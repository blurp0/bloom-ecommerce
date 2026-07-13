import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatHub from "@/features/messages/components/ChatHub";

export const metadata = {
  title: "Messages | Bloom & Bind",
  description:
    "Chat with the seller about your orders.",
};

/**
 * Messages hub page.
 *
 * Auth-gated — redirects to sign-in if unauthenticated.
 * Renders ChatHub client component for split-panel messaging.
 */
export default async function MessagesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(
      "/sign-in?redirect_url=" +
        encodeURIComponent("/messages"),
    );
  }

  return <ChatHub />;
}