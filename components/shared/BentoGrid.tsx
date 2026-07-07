import type { ReactNode } from "react"

type BentoGridProps = {
    children: ReactNode
    className?: string
    columns?: 2 | 3 | 4
    gap?: "sm" | "md" | "lg"
}

const gapToClass: Record<NonNullable<BentoGridProps["gap"]>, string> = {
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-8",
}

export function BentoGrid({
    children,
    className,
    columns = 3,
    gap = "md",
}: BentoGridProps) {
    const colsClass =
        columns === 2
            ? "lg:grid-cols-2"
            : columns === 4
                ? "lg:grid-cols-4"
                : "lg:grid-cols-3"

    return (
        <div
            className={[
                "grid grid-cols-1 md:grid-cols-2",
                colsClass,
                gapToClass[gap],
                className ?? "",
            ].join(" ")}
        >
            {children}
        </div>
    )
}
