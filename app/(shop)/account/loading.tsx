import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonLines } from "@/components/shared/Skeletons";

export default function AccountLoading() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Profile card skeleton */}
            <div className="clay-card border border-border-default bg-bg-surface p-6 flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40 rounded-md" />
                    <Skeleton className="h-3 w-56 rounded-md" />
                </div>
            </div>

            {/* Section card skeletons */}
            {["Saved Addresses", "Order History", "Theme Settings"].map((label) => (
                <div
                    key={label}
                    className="clay-card border border-border-default bg-bg-surface p-6 space-y-3"
                >
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <SkeletonLines lines={3} />
                </div>
            ))}
        </div>
    );
}
