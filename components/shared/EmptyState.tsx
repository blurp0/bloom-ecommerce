import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type EmptyStateVariant = "default" | "compact"

export function EmptyState({
    title,
    description,
    icon,
    primaryAction,
    secondaryAction,
    variant = "default",
}: {
    title: string
    description?: string
    icon?: ReactNode
    primaryAction?: ReactNode
    secondaryAction?: ReactNode
    variant?: EmptyStateVariant
}) {
    const isCompact = variant === "compact"

    return (
        <div
            className={cn(
                "w-full rounded-2xl border border-border-default bg-bg-surface",
                "shadow-sm px-6 sm:px-8",
                isCompact ? "py-6" : "py-10",
                "flex flex-col items-center text-center space-y-4",
            )}
        >
            {icon ? <div className="text-text-muted">{icon}</div> : null}

            <div className={isCompact ? "space-y-2" : "space-y-3"}>
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
                    {title}
                </h2>
                {description ? (
                    <p className="text-text-muted text-sm sm:text-base">{description}</p>
                ) : null}
            </div>

            {(primaryAction || secondaryAction) ? (
                <div
                    className={cn(
                        "flex flex-col sm:flex-row gap-3 sm:gap-4",
                        isCompact ? "pt-0" : "pt-2",
                    )}
                >
                    {primaryAction ? primaryAction : null}
                    {secondaryAction ? secondaryAction : null}
                </div>
            ) : null}
        </div>
    )
}
