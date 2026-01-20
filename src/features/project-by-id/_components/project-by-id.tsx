"use client";

import {
    ArrowLeftIcon,
    CalendarIcon,
    ChartColumnIcon,
    CheckCircleIcon,
    ClockIcon,
    Columns3Icon,
    FileStackIcon,
    PlusIcon,
    SettingsIcon,
    TriangleAlertIcon,
    UsersIcon,
    ZapIcon,
    ExternalLinkIcon,
    PencilIcon,
    Trash2Icon,
    FileTextIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { BadgeText } from "@/components/ui/badge-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskTable } from "./task-table";
import { CreateNewTaskForm } from "./create-new-task";
import { useTaskForm } from "../hooks/use-task-form";
import { DataKanban } from "./data-kanban";
import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { useSuspenseProjectPerformance } from "../hooks/use-project-by-id";
import {
    useChangeTaskPositionStatus,
    useCreateTask,
    useRemoveTask,
    useSuspenseTasks,
} from "../hooks/use-task";
import { TaskStatus } from "@/generated/prisma";
import { useTaskParams } from "../hooks/use-taks-params";
import { useProjectTaskSearch } from "../hooks/use-project-task-search";
import { useOrgMembers } from "@/features/organization-members/hooks/use-organization-members";
import { PAGINATION } from "@/lib/config";
import { SearchBox } from "@/components/search_box";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { ProjectsParams, Task } from "../types";
import { ReactNode } from "react";
import { differenceInDays, format } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRemoveTaskDialog } from "../hooks/use-remove-task-dialog";
import { DataCalendar } from "./data-calender";
import { useTaskDetails } from "../hooks/use-task-details";
import { BadgeTaskStatus } from "@/components/ui/badge-task-status";
import { DottedSeparator } from "@/components/dotted-separator";
import { Editor } from "./editor";
import { DocumentLists } from "./document-list";

export const ProjectTaskErrorView = () => {
    return <ErrorView message="Error loading tasks of projects" />;
};

export const ProjectTaskLoadingView = () => {
    return <LoadingView message="Loading tasks of projects..." />;
};

interface ProjectAvatarProps {
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export const ProjectAvatar = ({
    name,
    className,
    fallbackClassName,
}: ProjectAvatarProps) => {
    return (
        <Avatar className={cn("size-5 rounded-md", className)}>
            <AvatarFallback
                className={cn(
                    "text-white bg-blue-600 font-semibold text-sm uppercase rounded-md",
                    fallbackClassName
                )}
            >
                {name[0]}
            </AvatarFallback>
        </Avatar>
    );
};

interface TaskDateProps {
    value: Date;
    className?: string;
}

export const TaskDate = ({ value, className }: TaskDateProps) => {
    const today = new Date();
    const endDate = new Date(value);
    const diffInDays = differenceInDays(endDate, today);

    let textColor = "text-muted-foreground";

    if (diffInDays <= 3) {
        textColor = "text-red-500";
    } else if (diffInDays <= 7) {
        textColor = "text-orange-500";
    } else if (diffInDays <= 14) {
        textColor = "text-yellow-500";
    }

    return (
        <div className={textColor}>
            <span className={cn("truncate", className)}>{format(value, "PPP")}</span>
        </div>
    );
};

interface MemberAvatarProps {
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export const MemberAvatar = ({
    name,
    className,
    fallbackClassName,
}: MemberAvatarProps) => {
    return (
        <Avatar
            className={cn(
                "size-5 transition border border-neutral-300 rounded-full",
                className
            )}
        >
            <AvatarFallback
                className={cn(
                    "bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center",
                    fallbackClassName
                )}
            >
                {name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
};

const TaskDetail = () => {
    const { setOpen, open, initialState } = useTaskDetails();
    const taskStatus = initialState.status ?? TaskStatus.TODO;
    const assigneeName =
        initialState.assignee?.name ?? initialState.assignee?.email ?? "Unassigned";
    const projectName = initialState.project?.name ?? "Project";
    const dueDateValue = initialState.dueDate
        ? new Date(initialState.dueDate)
        : null;
    const dueDateLabel =
        dueDateValue && !Number.isNaN(dueDateValue.getTime())
            ? format(dueDateValue, "MMM dd, yyyy")
            : "No due date";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader className=" flex flex-col items-start">
                    <div className="flex items-start gap-2">
                        <DialogTitle>{initialState.name || "Task details"}</DialogTitle>

                        <BadgeTaskStatus status={taskStatus} />
                    </div>

                    <DialogDescription className="text-muted-foreground text-left">
                        {initialState.description || "No description"}
                    </DialogDescription>
                </DialogHeader>

                <DottedSeparator />
                <div className="flex items-center gap-x-1.5">
                    <MemberAvatar
                        name={assigneeName}
                        fallbackClassName="text-[10px]"
                    />
                    <div className="size-1 rounded-full bg-neutral-300" />
                    <span className={cn("truncate text-xs")}>
                        {dueDateLabel}
                    </span>
                </div>
                <div className="flex items-center gap-x-1.5">
                    <ProjectAvatar
                        name={projectName}
                        fallbackClassName="text-[10px]"
                    />
                    <span className="text-xs font-medium">
                        {projectName}
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const SearchSection = () => {
    const [params, setParams] = useTaskParams() as [
        ProjectsParams,
        (p: ProjectsParams) => void
    ];
    const { searchValue, onSearchChange } = useProjectTaskSearch({
        params,
        setParams,
    });

    const { data: membersList, isLoading } = useOrgMembers();

    const onUpdateFilter = <K extends keyof ProjectsParams>(
        key: K,
        value: ProjectsParams[K] | "ALL"
    ) => {
        const next = { ...params, page: PAGINATION.DEFAULT_PAGE };

        if (value === "ALL" || value === undefined) {
            // Nuqs removes params when the value is null.
            setParams({
                ...next,
                [key]: null,
            } as ProjectsParams);
            return;
        }

        setParams({
            ...next,
            [key]: value as ProjectsParams[K],
        });
    };

    return (
        <div className="flex items-center gap-3 ">
            <SearchBox
                placeholder="Search task..."
                value={searchValue}
                onChange={onSearchChange}
            />
            <Select
                value={params.status ?? "ALL"}
                onValueChange={(val) =>
                    onUpdateFilter("status", val as ProjectsParams["status"] | "ALL")
                }
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Statues" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All status</SelectItem>
                    <SelectItem value="TODO">Todo</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={params.assigneeId ?? "ALL"}
                onValueChange={(val) =>
                    onUpdateFilter(
                        "assigneeId",
                        val as ProjectsParams["assigneeId"] | "ALL"
                    )
                }
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All </SelectItem>
                    {isLoading ? (
                        <SelectItem value="No lead">
                            <Spinner className="text-muted-foreground" />
                        </SelectItem>
                    ) : (
                        membersList?.map(({ email, id }) => (
                            <SelectItem key = {id} value={id}>{email}</SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};

const TaskListPagination = () => {
    const { data, isFetching } = useSuspenseTasks();
    const [params, setParams] = useTaskParams();

    return (
        <Pagination
            disabled={isFetching}
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(page) =>
                setParams({
                    ...params,
                    page,
                })
            }
        />
    );
};

const RemoveTaskDialog = () => {
    const { open, setOpen, initialState } = useRemoveTaskDialog();

    const { mutate: onRemoveTask, isPending } = useRemoveTask();

    const onConfirmRemove = () => {
        onRemoveTask(
            {
                id: initialState.id as string,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                },
            }
        );
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete task "{initialState.name}"?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. It will permanently remove this task
                        and its data from the project.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isPending}
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction disabled={isPending} onClick={onConfirmRemove}>
                        {isPending ? (
                            <>
                                <Spinner />
                                Removing...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};



interface TaskActionProps {
    initialState: { id: string; name: string };
    initialData: Task;
    children: ReactNode;
}

export const TaskActions = ({
    initialState,
    initialData,
    children,
}: TaskActionProps) => {
    const { setOpen, setInitialState } = useTaskForm();
    const {
        setOpen: setOpenRemoveDialog,
        setInitialState: setRemoveTaskInitialState,
    } = useRemoveTaskDialog();
    const { setOpen: setOpenTaskDetails, setInitialState: setTaskInitialState } =
        useTaskDetails();

    return (
        <div>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        className="font-medium p-2.5"
                        onClick={() => {
                            setOpenTaskDetails(true);
                            setTaskInitialState(initialData);
                        }}
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setOpen(true);
                            setInitialState(initialData);
                        }}
                        className="font-medium p-2.5"
                    >
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setOpenRemoveDialog(true);
                            setRemoveTaskInitialState(initialState);
                        }}
                        // disabled={isPending}
                        className="text-amber-700 focus:text-amber-700 font-medium p-2.5"
                    >
                        <Trash2Icon className="size-4 mr-2 stroke-2" />
                        Delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export const TaskTabs = () => {
    const { data } = useSuspenseTasks();
    const { mutate: onChangeTaskPositionStatus } = useChangeTaskPositionStatus();

    return (
        <Tabs defaultValue="task" className="w-full ">
            <TabsList className="p-0 rounded-sm">
                <TabsTrigger value="task" className=" px-5">
                    <FileStackIcon className=" size-4" />
                    Task
                </TabsTrigger>
                <TabsTrigger value="kanban" className=" px-5">
                    <Columns3Icon className=" size-4" />
                    Kanban
                </TabsTrigger>
                <TabsTrigger value="calender" className=" px-5">
                    <CalendarIcon className=" size-4" />
                    Calendar
                </TabsTrigger>
                <TabsTrigger value="document" className=" px-5">
                    <FileTextIcon className=" size-4" />
                    Document
                </TabsTrigger>
            </TabsList>
            <TabsContent value="task">
                <TaskTable
                    searchFilter={<SearchSection />}
                    pagination={<TaskListPagination />}
                    taskList={data.tasks}
                />
            </TabsContent>
            <TabsContent value="kanban" className="bg-card">
                <DataKanban
                    data={data.tasks}
                    onChange={(updates) => onChangeTaskPositionStatus({ updates })}
                />
            </TabsContent>
            <TabsContent value="calender">
                <DataCalendar data={data.tasks} />
            </TabsContent>
            <TabsContent value = "document">
                <DocumentLists/>
            </TabsContent>
        </Tabs>
    );
};

export const ProjectIdView = () => {
    const { data } = useSuspenseProjectPerformance();

    const { setOpen } = useTaskForm();

    const navigate = useRouter();

    return (
        <>
            <main className=" p-6 flex flex-col gap-6 ">
                {/* start to header */}
                <section className=" flex items-center justify-between">
                    <div className=" flex items-center gap-5">
                        <ArrowLeftIcon
                            className=" size-5 cursor-pointer"
                            onClick={() => navigate.back()}
                        />

                        <h4 className=" text-xl">{data.project.name}</h4>

                        <BadgeText status={data.project.status} />
                    </div>
                    <Button onClick={() => setOpen(true)}>
                        <PlusIcon className=" size-5" /> New Task
                    </Button>
                </section>
                {/* end to header */}

                {/* start to total progress count */}
                {/* TODO: add the data and show the all total count */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
                    <Card className=" rounded-sm">
                        <CardContent className="">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-blue-500 text-sm font-medium">
                                    Total Task
                                </h3>
                                <ZapIcon className={`size-5 text-blue-500`} />
                            </div>
                            <p className="text-4xl font-bold ">{data.totalTasks}</p>
                        </CardContent>
                    </Card>

                    <Card className=" rounded-sm">
                        <CardContent className="">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-green-500 text-sm font-medium">
                                    Completed
                                </h3>
                                <ZapIcon className={`size-5 text-green-500`} />
                            </div>
                            <p className="text-4xl font-bold ">{data.completed}</p>
                        </CardContent>
                    </Card>

                    <Card className=" rounded-sm">
                        <CardContent className="">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-yellow-500 text-sm font-medium">
                                    In Progress
                                </h3>
                                <ZapIcon className={`size-5 text-yellow-500`} />
                            </div>
                            <p className="text-4xl font-bold ">{data.inProgress}</p>
                        </CardContent>
                    </Card>

                    <Card className=" rounded-sm">
                        <CardContent className="">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-indigo-400 text-sm font-medium">
                                    Team Members
                                </h3>
                                <ZapIcon className={`size-5 text-indigo-500`} />
                            </div>
                            <p className="text-4xl font-bold ">{data.teamMembers}</p>
                        </CardContent>
                    </Card>
                </section>
                {/* end to total progress count */}

                {/* start to tabs */}
                <TaskTabs />
                {/* end to tabs */}
            </main>

            {/* start to create new task */}
            <CreateNewTaskForm />
            {/* end to create new task */}

            {/* start to remove task dialog */}
            <RemoveTaskDialog />
            {/* end to remove task dialog */}

            {/* start to task details */}
            <TaskDetail />
            {/* end to task details */}
        </>
    );
};
