"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"
import { ProjectStatus } from "@/generated/prisma"



const statusStyles: Record<
    ProjectStatus,
    { label: string; className: string; value: number }
> = {
    PLANNING: {
        label: "Planning",
        className: "bg-amber-100 text-amber-800",
        value: 10,
    },
    ACTIVE: {
        label: "Active",
        className: "bg-green-100 text-green-800",
        value: 30,
    },
    IN_PROGRESS: {
        label: "In Progress",
        className: "bg-blue-100 text-blue-800",
        value: 60,
    },
    ON_HOLD: {
        label: "On Hold",
        className: "bg-slate-100 text-slate-800",
        value: 40,
    },
    COMPLETED: {
        label: "Completed",
        className: "bg-emerald-100 text-emerald-800",
        value: 100,
    },
};


type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
    status?: ProjectStatus
}

function ProjectProgress({ className, value, status = "ACTIVE", ...props }: ProgressProps) {
    const statusValue = statusStyles[status].value;
    const statusClassName = statusStyles[status].className;

    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn(
                "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
                className
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn("h-full w-full flex-1 transition-all", statusClassName)}
                style={{ transform: `translateX(-${100 - (statusValue || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    )
}

export { ProjectProgress }
