import { cn } from "@/lib/utils"

type Priority = "LOW" | "MEDIUM" | "HIGH"

const priorityStyles: Record<Priority, { label: string; className: string }> = {
    LOW: {
        label: "Low",
        className: "bg-emerald-100 text-emerald-800",
    },
    MEDIUM: {
        label: "Medium",
        className: "bg-amber-100 text-amber-800",
    },
    HIGH: {
        label: "High",
        className: "bg-red-100 text-red-800",
    },
}

interface BadgeTextProps {
    priority?: Priority
    className?: string
}

/**
 * Priority badge for tasks.
 * @param priority Task priority variant. Defaults to "MEDIUM".
 * @example
 * <BadgeText priority="HIGH" />
 */
export const BadgePriority = ({
    priority = "MEDIUM",
    className,
}: BadgeTextProps) => {
    const { label, className: priorityClassName } = priorityStyles[priority]

    return (
        <span
            className={cn(
                "px-2 py-0.5 font-medium rounded-sm text-xs",
                priorityClassName,
                className
            )}
        >
            {label}
        </span>
    )
}
