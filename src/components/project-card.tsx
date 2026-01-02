"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BadgeText } from "./ui/badge-text";
import { ProjectPriority, ProjectStatus } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { Calendar1Icon, MoreHorizontalIcon, UsersIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProjectProgress } from "./ui/project-progress";
import { ProjectActions, statusStyles } from "@/features/projects/_components/projects";
import { Project } from "@/features/projects/types";

const priorityStyles: Record<ProjectPriority, { label: string; className: string }> = {
    LOW: {
        label: "Low",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    MEDIUM: {
        label: "Medium",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    HIGH: {
        label: "High",
        className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    CRITICAL: {
        label: "Critical",
        className: "bg-rose-50 text-rose-700 border-rose-200",
    },
};

const checkPriority = (priority: ProjectPriority) =>
    priorityStyles[priority] ?? { label: "Unknown", className: "bg-slate-50 text-slate-700 border-slate-200" };

interface Props {
    data : Project
    className?: string;
};

/**
 * Project summary card with status badge, priority pill, and progress bar.
 * @param name Project display name.
 * @param description Optional short description.
 * @param status Project status used for badge and progress color.
 * @param priority Project priority rendered as a colored pill.
 * @example
 * <ProjectCard
 *   name="Billing Revamp"
 *   description="Redesign payment flow"
 *   status={ProjectStatus.ACTIVE}
 *   priority={ProjectPriority.HIGH}
 * />
 */
export const ProjectCard = ({
    data ,
    className = ""
}: Props) => {
    const { slug } = useParams();
    const { label } = checkPriority(data.priority);
    const navigate = useRouter()
    const memberCount = Array.isArray(data.members) ? data.members.length : 0;
    const hasMembers = memberCount > 0;
    const endDateValue = data.endDate ? new Date(data.endDate) : null;
    const endDateLabel =
        endDateValue && !Number.isNaN(endDateValue.getTime())
            ? format(endDateValue, "MMM dd, yyyy")
            : null;

    return (
        <Card className={cn("rounded-sm h-56 border-none shadow-none", className)}>
            <div className=" relative">
                <CardHeader>
                    <CardTitle className=" font-semibold">
                        {data.name}
                    </CardTitle>
                    {data.description && (
                        <CardDescription className=" text-sm line-clamp-2">
                            {data.description}
                        </CardDescription>
                    )}
                </CardHeader>
                <div className=" absolute top-1 right-3">
                    <ProjectActions 
                        initialState = {data} onProjectDetails={() =>
                        navigate.push(`/organizations/${slug}/projects/${data.id}`)
                    } >
                        <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0  transition" />
                    </ProjectActions>
                </div>
            </div>
            <CardContent >
                <div className=" flex items-start justify-between">
                    <div className="">
                        <BadgeText status={data.status} />

                        {(hasMembers || endDateLabel) && (
                            <div className="flex items-center gap-2 mt-3">
                                {hasMembers && (
                                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                        <UsersIcon className="size-3" />
                                        {memberCount} Members
                                    </div>
                                )}
                                {endDateLabel && (
                                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                        <Calendar1Icon className="size-3" />
                                        {endDateLabel}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <span className={cn("px-2 py-0.5 text-xs text-muted-foreground rounded-sm")}>
                        <span className=" text-sm">
                            {label}
                        </span>{" "}
                        Priority
                    </span>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className=" flex items-center w-full justify-between gap-2">
                    <p>Progress</p>

                    <span className=" text-muted-foreground text-xs">
                        {statusStyles[data.status].value}%
                    </span>
                </div>
                <ProjectProgress status={data.status} />
            </CardFooter>
        </Card>
    )
}
