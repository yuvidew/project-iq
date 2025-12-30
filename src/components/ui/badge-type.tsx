import { cn } from "@/lib/utils"
import {
    Bug,
    CheckSquare,
    Sparkles,
    Wrench,
    MoreHorizontal,
} from "lucide-react"

type TaskType = "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER"

const taskTypeStyles: Record<
    TaskType,
    {
        label: string
        className: string
        icon: React.ElementType
    }
> = {
    TASK: {
        label: "Task",
        className: "text-emerald-500",
        icon: CheckSquare,
    },
    BUG: {
        label: "Bug",
        className: "text-red-500",
        icon: Bug,
    },
    FEATURE: {
        label: "Feature",
        className: "text-blue-500",
        icon: Sparkles,
    },
    IMPROVEMENT: {
        label: "Improvement",
        className: "text-purple-500",
        icon: Wrench,
    },
    OTHER: {
        label: "Other",
        className: "text-amber-500",
        icon: MoreHorizontal,
    },
}

interface BadgeTaskTypeProps {
    type?: TaskType
    className?: string
}

/**
 * Task type badge with icon.
 * @param type Task type variant. Defaults to "TASK".
 * @example
 * <BadgeTaskType type="BUG" />
 */
export const BadgeTaskType = ({
    type = "TASK",
    className,
}: BadgeTaskTypeProps) => {
    const { label, className: typeClassName, icon: Icon } =
        taskTypeStyles[type]

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium",
                typeClassName,
                className
            )}
        >
            <Icon className="size-4" />
            {label.toUpperCase()}
        </span>
    )
}
