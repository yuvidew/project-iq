import { cn } from "@/lib/utils"

type BadgeStatus = "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "ACTIVE"

const statusStyles: Record<BadgeStatus, { label: string; className: string }> = {
    PLANNING: {
        label: "Planning",
        className: "bg-amber-100 text-amber-800",
    },
    IN_PROGRESS: {
        label: "In Progress",
        className: "bg-blue-100 text-blue-800",
    },
    ON_HOLD: {
        label: "On Hold",
        className: "bg-slate-100 text-slate-800",
    },
    COMPLETED: {
        label: "Completed",
        className: "bg-emerald-100 text-emerald-800",
    },
    ACTIVE: {
        label: "Active",
        className: "bg-green-100 text-green-800",
    },
}

interface BadgeTextProps {
    status?: BadgeStatus
    className?: string
}

/**
 * Status badge for projects.
 * @param status Project status variant to render. Defaults to "ACTIVE".
 * @param className Optional extra classes for custom sizing/spacing.
 * @example
 * // Renders "In Progress" badge with blue tones
 * <BadgeText status="IN_PROGRESS" />
 */
export const BadgeText = ({ status = "ACTIVE", className }: BadgeTextProps) => {
  const { label, className: statusClassName } = statusStyles[status]

  return (
    <span className={cn("px-2 py-0.5 font-medium rounded-sm text-xs", statusClassName, className)}>
            {label}
        </span>
    )
}
