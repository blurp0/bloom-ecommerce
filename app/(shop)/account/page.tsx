import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma/client";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AccountPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in?redirect_url=/account");
    }

    const [dbUser, clerkUser] = await Promise.all([
        prisma.user.findUnique({ where: { clerkId: userId } }),
        currentUser(),
    ]);

    const name = dbUser?.name ?? clerkUser?.fullName ?? "User";
    const email = dbUser?.email ?? clerkUser?.emailAddresses[0]?.emailAddress ?? "";

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Profile Card */}
            <div className="clay-card border border-border-default bg-bg-surface p-6 flex items-center gap-4">
                <UserButton />
                <div>
                    <p className="text-lg font-semibold text-text-primary">{name}</p>
                    <p className="text-sm text-text-muted">{email}</p>
                    {dbUser?.role && (
                        <p className="text-xs text-text-muted capitalize mt-0.5">{dbUser.role.toLowerCase()}</p>
                    )}
                </div>
            </div>

            {/* Saved Addresses */}
            <div className="clay-card border border-border-default bg-bg-surface p-6 space-y-3">
                <h2 className="text-base font-semibold text-text-primary">Saved Addresses</h2>
                <EmptyState
                    title="No addresses yet"
                    description="Coming soon"
                    variant="compact"
                />
            </div>

            {/* Order History */}
            <div className="clay-card border border-border-default bg-bg-surface p-6 space-y-3">
                <h2 className="text-base font-semibold text-text-primary">Order History</h2>
                <EmptyState
                    title="No orders yet"
                    description="Coming soon"
                    variant="compact"
                />
            </div>

        </div>
    );
}
