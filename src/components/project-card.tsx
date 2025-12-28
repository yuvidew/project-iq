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
import { Progress } from "./ui/progress";
import {  ProjectPriority, ProjectStatus } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { Calendar1Icon, UsersIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";

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
    id : string;
    name : string;
    description? : string | null;
    status  : ProjectStatus;
    priority : ProjectPriority;
    members? : number;
    endDate? : Date | null;
    classname? : string 
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
    id,
    name,
    description,
    status,
    priority,
    members,
    endDate,
    classname = ""
}: Props) => {
    const {slug} = useParams()
    const { label } = checkPriority(priority);

    return (
        <Link href={`/organizations/${slug}/projects/${id}`} prefetch>
            <Card className={` rounded-sm h-56 border-none  shadow-none ${classname}`}>
                <CardHeader>
                    <CardTitle className=" font-semibold">
                        {name}
                    </CardTitle>
                    {description && (
                        <CardDescription className=" text-sm line-clamp-2">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent >
                    <div className=" flex items-start justify-between">
                        <div className="">
                            <BadgeText status={status} />

                            {(members && endDate) && (
                                <div className="flex items-center gap-2 mt-3">
                                    <div className=" flex items-center gap-1 text-muted-foreground text-xs">
                                        <UsersIcon className=" size-3"/>
                                        {members} Members
                                    </div>
                                    <div className=" flex items-center gap-1 text-muted-foreground text-xs">
                                        <Calendar1Icon className=" size-3"/>
                                        {format(endDate, "MMM dd, yyyy")} 
                                    </div>
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

                        <span className=" text-muted-foreground">
                            0%
                        </span>
                    </div>
                    <Progress status={status}/>
                </CardFooter>
            </Card>
        </Link>
    )
}
