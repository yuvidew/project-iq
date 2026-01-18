"use client";

import { useGetMyTasks } from "@/features/project-by-id/hooks/use-task";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
} from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";
import { TaskStatus } from "@/generated/prisma";
import { cn } from "@/lib/utils";

const SidebarMenuItems = () =>
    [1, 2, 3].map((idx) => (
        <Skeleton key={idx} className="w-full h-7 rounded-sm" />
    ));

export const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
        case "BACKLOG":
            return {
                label: "Backlog",
                className: "bg-slate-100",
            };

        case "IN_REVIEW":
            return {
                label: "In Review",
                className: "bg-purple-100",
            };

        case "TODO":
            return {
                label: "Todo",
                className: "bg-amber-100",
            };

        case "IN_PROGRESS":
            return {
                label: "In Progress",
                className: "bg-blue-100",
            };

        case "DONE":
            return {
                label: "Done",
                className: "bg-emerald-100",
            };

        default:
            return {
                label: "Unknown",
                className: "bg-gray-100",
            };
    }
};

export const MyTaskList = () => {
    const { data, isFetching } = useGetMyTasks();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>My Tasks {data?.length || 0}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {isFetching ? (
                        <SidebarMenuItems />
                    ) : data?.length ? (
                        data.map(({ status, name }, index) => (
                            <SidebarMenuButton key={index} className="h-14">
                                <span
                                    className={cn(
                                        "size-2 rounded-full",
                                        getStatusStyle(status).className,
                                    )}
                                />
                                <div className="flex flex-col ">
                                    <h3 className="text-sm line-clamp-1 truncate">
                                        {name}
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {getStatusStyle(status).label}
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        ))
                    ) : (
                        <SidebarMenuButton className="text-center text-muted-foreground">
                            No tasks yet
                        </SidebarMenuButton>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};
