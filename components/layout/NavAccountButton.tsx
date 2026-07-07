"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { SIGN_IN_URL } from "@/lib/clerk/config";

export default function NavAccountButton() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="inline-flex items-center justify-center h-[44px] w-[44px]">
        <UserButton />
      </div>
    );
  }

  return (
    <Link
      href={SIGN_IN_URL}
      className="inline-flex items-center justify-center h-[44px] w-[44px] rounded-lg text-text-muted hover:text-accent-secondary hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-0"
      aria-label="Sign In"
    >
      <User className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}
