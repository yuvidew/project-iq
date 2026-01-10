import { cn } from "@/lib/utils"

type BadgeStatus = "BACKLOG" | "IN_REVIEW" | "TODO" | "IN_PROGRESS" | "DONE"

const statusStyles: Record<BadgeStatus, { label: string; className: string }> = {
    BACKLOG: {
        label: "Backlog",
        className: "bg-slate-100 text-slate-800",
    },
    IN_REVIEW: {
        label: "In Review",
        className: "bg-purple-100 text-purple-800",
    },
    TODO: {
        label: "Todo",
        className: "bg-amber-100 text-amber-800",
    },
    IN_PROGRESS: {
        label: "In Progress",
        className: "bg-blue-100 text-blue-800",
    },
    DONE: {
        label: "Done",
        className: "bg-emerald-100 text-emerald-800",
    },
}

interface BadgeTaskStatusProps {
    status?: BadgeStatus
    className?: string
}

/**
 * Status badge for tasks.
 * @param status Task status variant to render. Defaults to "TODO".
 * @param className Optional extra classes for custom sizing/spacing.
 * @example
 * // Renders "In Progress" badge with blue tones
 * <BadgeTaskStatus status="IN_PROGRESS" />
 */
export const BadgeTaskStatus = ({ status = "TODO", className }: BadgeTaskStatusProps) => {
    const { label, className: statusClassName } = statusStyles[status]

    return (
        <span className={cn("inline-flex w-fit items-center rounded-sm px-2 py-0.5 text-xs font-medium", statusClassName, className)}>
            {label}
        </span>
    )
}
