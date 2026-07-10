import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCartLineItem() {
    return (
        <div aria-hidden="true" className="clay-card flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
                <Skeleton className="flex-shrink-0 w-4 h-4 rounded mt-5" />
                <Skeleton className="flex-shrink-0 w-16 h-16 rounded-[12px]" />
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <Skeleton className="h-3 w-1/3 rounded-md" />
                        </div>
                        <Skeleton className="h-7 w-7 rounded-md flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-4 w-16 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    )
}

type SkeletonCardGridProps = {
    count?: number
    className?: string
}

export function SkeletonCardGrid({ count = 6, className }: SkeletonCardGridProps) {
    return (
        <div
            aria-hidden="true"
            className={[
                "w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
                className ?? "",
            ].join(" ")}
        >
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="space-y-3">
                    <Skeleton className="h-36 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                    <div className="flex items-center justify-between pt-1">
                        <Skeleton className="h-5 w-16 rounded-md" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    )
}

type SkeletonLinesProps = {
    lines?: number
    className?: string
}

export function SkeletonLines({ lines = 3, className }: SkeletonLinesProps) {
    return (
        <div aria-hidden="true" className={["space-y-3", className ?? ""].join(" ")}>
            {Array.from({ length: lines }).map((_, idx) => (
                <Skeleton
                    key={idx}
                    className={[
                        "rounded-md",
                        idx === 0 ? "h-4 w-full" : idx === 1 ? "h-3 w-5/6" : "h-3 w-3/4",
                    ].join(" ")}
                />
            ))}
        </div>
    )
}

// Optional helper if later screens want chat-like skeletons.
// Included here because it matches the spec "optional but preferred".
type SkeletonMessageThreadProps = {
    pairs?: number
    className?: string
}

export function SkeletonMessageThread({
    pairs = 3,
    className,
}: SkeletonMessageThreadProps) {
    const items: ReactNode[] = []
    for (let i = 0; i < pairs; i++) {
        items.push(
            <div key={`l-${i}`} className="flex gap-3 items-start">
                <div className="mt-0.5">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                    <Skeleton className="h-3 w-5/6 rounded-md" />
                </div>
            </div>,
        )

        items.push(
            <div key={`r-${i}`} className="flex justify-end">
                <div className="space-y-2 flex flex-col items-end">
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                    <Skeleton className="h-3 w-5/6 rounded-md" />
                </div>
            </div>,
        )
    }

    return (
        <div aria-hidden="true" className={["space-y-4", className ?? ""].join(" ")}>
            {items}
        </div>
    )
}
