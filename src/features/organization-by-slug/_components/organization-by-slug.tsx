"use client";

import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { Separator } from '@/components/ui/separator';
import { ArrowRightIcon, Clock10Icon, HistoryIcon, TriangleAlertIcon, User2Icon, AlertTriangleIcon, CheckCircle2Icon, FolderOpenIcon, UsersIcon, PlusIcon, SquareIcon } from "lucide-react";
import { CreateNewProject } from "../../../components/create-new-project";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/project-card";
import { useProjectForm } from "@/features/projects/hooks/use-project-from";
import { Card, CardContent } from '@/components/ui/card';
import { useSuspenseOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { Project, Task } from "../types";
import { TaskStatus } from "@/generated/prisma";
import { format } from "date-fns";
import { BadgeTaskStatus } from "@/components/ui/badge-task-status";


export const OrganizationBySlugErrorView = () => {
    return <ErrorView message='Error loading organizations' />
};

export const OrganizationBySlugLoadingView = () => {
    return <LoadingView message='Loading organizations...' />
};

const EmptyProject = () => {
    const { setOpen } = useProjectForm()
    return (
        <div className=' py-10 w-full flex flex-col items-center justify-center gap-5'>

            <FolderOpenIcon className=' size-11 text-primary' />


            <h1 className=' text-muted-foreground'> No projects yet</h1>

            <Button onClick={() => setOpen(true)}>
                Create first project
            </Button>
        </div>
    )
};

const EmptyRecentActivityTask = () => {
    return (
        <div className=' py-10 w-full flex flex-col items-center justify-center gap-5'>
            <HistoryIcon className=' size-11 text-primary' />

            <h1 className=' text-muted-foreground'> No recent activity </h1>
        </div>
    )
}

const EmptyOverdue = () => {
    return (
        <div className=' py-10 w-full flex flex-col items-center justify-center gap-5'>

            <h1 className=' text-muted-foreground'> No overdue </h1>
        </div>
    )
}

const EmptyMyTask = () => {
    return (
        <div className=' py-10 w-full flex flex-col items-center justify-center gap-5'>

            <h1 className=' text-muted-foreground'> No my task </h1>
        </div>
    )
}

const EmptyInProgress = () => {
    return (
        <div className=' py-10 w-full flex flex-col items-center justify-center gap-5'>

            <h1 className=' text-muted-foreground'> No in progress </h1>
        </div>
    )
}




interface RecentTaskItemProps {
    data: Task
}

const RecentTaskItem = ({ data }: RecentTaskItemProps) => {
    const statusStyles: Record<TaskStatus, { label: string; className: string }> = {
        BACKLOG: {
            label: "Backlog",
            className: " text-slate-500",
        },
        IN_REVIEW: {
            label: "In Review",
            className: " text-purple-500",
        },
        TODO: {
            label: "Todo",
            className: " text-amber-500",
        },
        IN_PROGRESS: {
            label: "In Progress",
            className: " text-blue-500",
        },
        DONE: {
            label: "Done",
            className: " text-emerald-500",
        },
    };

    const dueDateLabel = data.dueDate
        ? format(new Date(data.dueDate), "MMM dd, yyyy")
        : "No due date";

    return (
        <Card className=" rounded-none border-none p-0 ">
            <CardContent className=" flex items-start justify-between gap-3 px-4 py-5">
                <div className=" bg-gray-50/10 p-1.5 rounded-sm mt-2">
                    <SquareIcon className={` size-4 ${statusStyles[data.status].className}`} />
                </div>
                <div className="w-full flex flex-col gap-2   ">
                    <h4 className=" text-lg line-clamp-1 p-0">
                        {data.name}
                    </h4>
                    {data.assignee && (
                        <div className="flex items-start gap-2">
                            <p className="text-xs text-muted-foreground">
                                Task
                            </p>

                            <p className="text-xs flex items-start gap-2 text-muted-foreground">
                                <span className=" w-4.5 h-4.5 text-xs flex items-center justify-center text-white rounded-full bg-muted-foreground uppercase">
                                    {data.assignee?.name?.[0]}
                                </span>

                                {data.assignee?.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {dueDateLabel}
                            </p>
                        </div>
                    )}
                </div>
                <BadgeTaskStatus status={data.status} />
            </CardContent>
        </Card>
    )
}

interface ProjectOverViewProps {
    data: Project[]
}
export const ProjectOverview = ({ data }: ProjectOverViewProps) => {


    return (
        <Card
            className=" rounded-sm w-full p-0"
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4 px-4 py-3 pb-0">
                    <h3 className=" text-lg font-medium">
                        Project Overview
                    </h3>
                    <p className="flex items-center gap-1 text-muted-foreground text-sm hover:underline ">
                        <span className=' text-muted-foreground text-sm'>View all</span> <ArrowRightIcon className='size-4 text-muted-foreground' />
                    </p>
                </div>
                <Separator className='w-full' />
                <div className=" flex flex-col">
                    {data.length === 0 ? (
                        <EmptyProject />
                    ) : data.map((project) => (
                        <ProjectCard
                            key={project.id}
                            data={project}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
};

interface RecentActivityTaskProps {
    data: Task[]
}

export const RecentActivityTask = ({ data }: RecentActivityTaskProps) => {
    return (
        <Card
            className=" rounded-sm w-full p-0"
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4 px-4 py-3 pb-0">
                    <h3 className="\ text-lg font-medium">
                        Recent Activity
                    </h3>

                </div>
                <Separator className='w-full' />
                {data.length === 0 ? (
                    <EmptyRecentActivityTask />
                ) : data.map((project) => (
                    <RecentTaskItem key={project.id} data={project} />
                ))}
            </CardContent>

        </Card>
    )
};

interface MyTaskItemProps {
    data: Task
}

const MyTaskItem = ({ data }: MyTaskItemProps) => (
    <Card className=" rounded-full border-none p-5">
        <CardContent className=" p-3 py-3 bg-card cursor-pointer  flex flex-col items-start justify-start gap-4 rounded-sm">
            <h4 className=" text-lg line-clamp-1 p-0">
                {data.name}
            </h4>
            <p className=" text-muted-foreground text-xs">
                Task {data.status}
            </p>
        </CardContent>
    </Card>
)

interface MyTaskProps {
    data: Task[]
}

export const MyTask = ({data} : MyTaskProps) => {
    const hasTasks = data.length > 0;

    return (
        <Card
            className=" rounded-sm w-full p-0"
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4 px-4 py-3 pb-0">
                    <div className=" flex items-center gap-2">
                        <Button size="icon-sm" variant={"shadow"} >
                            <User2Icon className=" text-primary" />
                        </Button>
                        <h3 className="\ text-sm font-medium">
                            My Task
                        </h3>
                    </div>
                    <Badge variant={"blue"} >
                        {data.length}
                    </Badge>
                </div>
                <Separator className='w-full' />
                {hasTasks === false ? (
                    <EmptyMyTask />
                ) :
                    data.map((task) => (
                        <MyTaskItem key = {task.id} data = {task} />
                    ))
                }
            </CardContent>

        </Card>
    )
}

interface OverdueProps {
    data: Task[]
}

export const Overdue = ({data} : OverdueProps) => {
    const hasTasks = data.length > 0;
    return (
        <Card
            className=" rounded-sm w-full p-0"
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4 px-4 py-3 pb-0">
                    <div className=" flex items-center gap-2">
                        <Button size="icon-sm" variant={"shadow"} >
                            <TriangleAlertIcon className=" text-primary" />
                        </Button>
                        <h3 className="\ text-sm font-medium">
                            Overdue
                        </h3>
                    </div>
                    <Badge variant={"destructive"} >
                        0
                    </Badge>
                </div>
                <Separator className='w-full' />
                {hasTasks === false ? (
                    <EmptyOverdue />
                ) :
                    data.map((task) => (
                        <MyTaskItem key = {task.id} data = {task} />
                    ))
                }
            </CardContent>

        </Card>
    )
}

interface InProgressProps {
    data: Task[]
}

export const InProgress = ({data} : InProgressProps) => {
    const hasTasks = data.length > 0;
    return (
        <Card
            className=" rounded-sm w-full p-0"
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4 px-4 py-3 pb-0">
                    <div className=" flex items-center gap-2">
                        <Button size="icon-sm" variant={"shadow"} >
                            <Clock10Icon className=" text-primary" />
                        </Button>
                        <h3 className="\ text-sm font-medium">
                            In Progress
                        </h3>
                    </div>
                    <Badge variant={"blue"} >
                        0
                    </Badge>
                </div>
                <Separator className='w-full' />
                {hasTasks === false ? (
                    <EmptyInProgress />
                ) :
                    data.map((task) => (
                        <MyTaskItem key = {task.id} data = {task} />
                    ))
                }
            </CardContent>
        </Card>
    )
}






export const OrganizationBySlug = () => {
    const { data } = useSuspenseOrganizationBySlug();
    const { setOpen } = useProjectForm();


    return (
        <>
            <main className='p-6 flex flex-col gap-9 '>
                {/* start to create new project section  */}
                <section className=' flex items-start justify-between'>
                    <div className='flex flex-col gap-2'>
                        <h1 className=' text-3xl font-semibold'>Welcome back, <span className=' text-primary'>yuvi</span></h1>
                        <p className=' text-sm text-muted-foreground'>Here's what's happening with your projects today</p>
                    </div>

                    <Button onClick={() => setOpen(true)}>
                        <PlusIcon />
                        Create New Project
                    </Button>

                </section>
                {/* end to create new project section  */}

                {/* start to progress card */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
                    <Card
                        className=" rounded-sm"
                    >
                        <CardContent className="">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">
                                    Total Projects
                                </h3>
                                <div className={`bg-blue-500/10 p-2 rounded-lg`}>
                                    <FolderOpenIcon className={`w-5 h-5 text-blue-500`} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-4xl font-bold ">
                                    {data.totalProjects}
                                </p>
                                <p className="text-gray-500 text-xs">
                                    projects in yuvraj dewangan
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className=" rounded-sm"
                    >
                        <CardContent className="">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">
                                    Completed Projects
                                </h3>
                                <div className={`bg-green-500/10 p-2 rounded-lg`}>
                                    <CheckCircle2Icon className={`w-5 h-5 text-green-500`} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-4xl font-bold ">
                                    {data.completedProjects}
                                </p>
                                <p className="text-gray-500 text-xs">
                                    of {data.totalProjects} total
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className=" rounded-sm"
                    >
                        <CardContent className="">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">
                                    My Tasks
                                </h3>
                                <div className={`bg-purple-500/10 p-2 rounded-lg`}>
                                    <UsersIcon className={`w-5 h-5 text-purple-500`} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-4xl font-bold ">
                                    {data.myTasks}
                                </p>
                                <p className="text-gray-500 text-xs">
                                    assigned to me
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className=" rounded-sm"
                    >
                        <CardContent className="">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">
                                    Overdue
                                </h3>
                                <div className={`bg-yellow-500/10 p-2 rounded-lg`}>
                                    <AlertTriangleIcon className={`w-5 h-5 text-yellow-500`} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-4xl font-bold ">
                                    {data.overdueTasks}
                                </p>
                                <p className="text-gray-500 text-xs">
                                    need attention
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
                {/* start to progress card */}

                {/* start to  next section*/}
                <div className=' grid lg:grid-cols-3 grid-cols-1 gap-5'>
                    {/* start to project overview and recent project */}
                    <div className=' lg:col-span-2 flex flex-col gap-5'>
                        <ProjectOverview data={data.projects} />
                        <RecentActivityTask data={data.recentActivity} />
                    </div>
                    {/* end to project overview and recent project */}
                    <div className='flex flex-col gap-5'>
                        <MyTask data={data.myTasksList} />
                        <Overdue data={data.overdueTasksList} />
                        <InProgress data = {data.inProgressTasks} />
                    </div>
                </div>
                {/* end to  next section*/}
            </main>
            <CreateNewProject />
        </>
    )
}
