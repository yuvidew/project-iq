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
} from "lucide-react";
import { useRouter } from "next/navigation";

import { BadgeText } from "@/components/ui/badge-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TaskTable } from "./task-table";
import { TaskByStatus } from "./task-by-status";
import { TaskByType } from "./task-by-type";
import { CreateNewTaskForm } from "./create-new-task";
import { useTaskForm } from "../hooks/use-task-form";
import { DataKanban } from "./data-kanban";
import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { useSuspenseProjectPerformance } from "../hooks/use-project-by-id";
import { useSuspenseTasks } from "../hooks/use-task";
import { TaskStatus } from "@/generated/prisma";
import { useTaskParams } from "../hooks/use-taks-params";
import { useProjectTaskSearch } from "../hooks/use-project-task-search";
import { useOrgMembers } from "@/features/organization-members/hooks/use-organization-members";
import { PAGINATION } from "@/lib/config";
import { SearchBox } from "@/components/search_box";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";

export const ProjectTaskErrorView = () => {
    return <ErrorView message='Error loading tasks of projects' />
};

export const ProjectTaskLoadingView = () => {
    return <LoadingView message='Loading tasks of projects...' />
};

const AnalyticsComp = () => {
    return (
        <section className=" w-full  flex flex-col gap-3 py-4">
            {/* start to complete count*/}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 ">
                <Card className=" rounded-sm">
                    <CardContent className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-green-500 text-sm font-medium">
                                Completed Rate
                            </h3>
                            <p className="text-4xl font-bold ">0</p>
                        </div>
                        <CheckCircleIcon className={`size-5 text-green-500`} />
                    </CardContent>
                </Card>

                <Card className=" rounded-sm">
                    <CardContent className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-blue-500 text-sm font-medium">Total Task</h3>
                            <p className="text-4xl font-bold ">0</p>
                        </div>
                        <ClockIcon className={`size-5 text-blue-500`} />
                    </CardContent>
                </Card>

                <Card className=" rounded-sm">
                    <CardContent className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-red-500 text-sm font-medium">Overdue task</h3>
                            <p className="text-4xl font-bold ">0</p>
                        </div>
                        <TriangleAlertIcon className={`size-5 text-red-500`} />
                    </CardContent>
                </Card>

                <Card className=" rounded-sm">
                    <CardContent className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-2 ">
                            <h3 className="text-indigo-400 text-sm font-medium">Team Size</h3>
                            <p className="text-4xl font-bold ">0</p>
                        </div>
                        <UsersIcon className={`size-5 text-indigo-500`} />
                    </CardContent>
                </Card>
            </div>
            {/* end to complete count*/}

            {/* start to chart bars */}
            <div className=" grid lg:grid-cols-2 gap-3">
                <TaskByStatus />
                <TaskByType />
            </div>
            {/* end to chart bars */}
        </section>
    );
};

type ProjectsParams = {
    search: string;
    page: number;
    status?: TaskStatus;
    assigneeId?: string;
};

const SearchSection = () => {
    const [params, setParams] = useTaskParams() as [
        ProjectsParams,
        (p: ProjectsParams) => void
    ];
    const { searchValue, onSearchChange } = useProjectTaskSearch({ params, setParams });

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
    }

    return (
        <div className="flex items-center gap-3 ">
            <SearchBox
                placeholder="Search task..."
                value={searchValue}
                onChange={onSearchChange}
            />
            <Select
                value={params.status ?? "ALL"}
                onValueChange={(val) => onUpdateFilter("status", val as ProjectsParams["status"] | "ALL")}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue
                        placeholder="All Statues" />
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
                onValueChange={(val) => onUpdateFilter("assigneeId", val as ProjectsParams["assigneeId"] | "ALL")}
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
                    ) : membersList?.map(({ email, id }) => (
                        <SelectItem value={id}>{email}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}


const TaskListPagination = () => {
    const { data, isFetching } = useSuspenseTasks();
    const [params, setParams] = useTaskParams();

    return (
        <Pagination
            disabled={isFetching}
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(page) => setParams({
                ...params,
                page
            })}
        />
    );

}

export const TaskTabs = () => {
    const { data } = useSuspenseTasks();
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
                <TabsTrigger value="analytics" className=" px-5">
                    <ChartColumnIcon className=" size-4" />
                    Analytics
                </TabsTrigger>
                <TabsTrigger value="setting" className=" px-5">
                    <SettingsIcon className=" size-4" />
                    Setting
                </TabsTrigger>
            </TabsList>
            <TabsContent value="task">
                <TaskTable
                    searchFilter={<SearchSection />}
                    pagination={<TaskListPagination/>}
                    taskList={data.tasks}
                />
            </TabsContent>
            <TabsContent value="kanban">
                <DataKanban />
            </TabsContent>
            <TabsContent value="calender">TODO: create calendar comp</TabsContent>
            <TabsContent value="analytics">
                <AnalyticsComp />
            </TabsContent>
            <TabsContent value="setting">Change your password here.</TabsContent>
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

                        <h4 className=" text-xl">Project name</h4>

                        <BadgeText status="ACTIVE" />
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

            <CreateNewTaskForm />
        </>
    );
};
