"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAllTasksDialog } from "@/hooks/use-all-tasks"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useGetMyTasks } from "@/features/project-by-id/hooks/use-task";
import { TaskStatus } from "@/generated/prisma";
import { cn } from "@/lib/utils";


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

export const AllTaskDialog = () => {
    const { data, isFetching } = useGetMyTasks();

    const { open, setOpen } = useAllTasksDialog();
    return (
        <Dialog open = {open}  onOpenChange={setOpen}>
            <DialogContent className="p-0">
                <DialogHeader className="hidden p-0">
                    <DialogTitle className="p-0"></DialogTitle>
                    <DialogDescription className="p-0"></DialogDescription>
                </DialogHeader>
                <Command>
                    <CommandInput placeholder="Type a command or search..." className=" h-8" />
                    <CommandList>
                        <CommandGroup heading="My tasks">
                            {isFetching ? (
                                <CommandEmpty>No results found.</CommandEmpty>
                            ) : data?.length ? (
                                data.map(({ status, name }, index) => (
                                    <CommandItem key={index} className="h-14">
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
                                    </CommandItem>
                                ))
                            ) : (
                                <CommandItem className="text-center text-muted-foreground">
                                    No tasks yet
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}
