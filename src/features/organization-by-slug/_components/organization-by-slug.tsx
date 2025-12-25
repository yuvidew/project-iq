"use client";

import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRightIcon, Clock10Icon, FolderOpenIcon, HistoryIcon, TriangleAlertIcon, User2Icon } from "lucide-react";
import { CreateNewProject } from "../../../components/create-new-project";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const OrganizationBySlugErrorView = () => {
    return <ErrorView message='Error loading organizations' />
};

export const OrganizationBySlugLoadingView = () => {
    return <LoadingView message='Loading organizations...' />
};

const EmptyProject = () => {
    return (
        <div className=' py-10 w-full flex flex-col items-center justify-center gap-5'>

            <FolderOpenIcon className=' size-11 text-primary' />


            <h1 className=' text-muted-foreground'> No projects yet</h1>

            <CreateNewProject title="Create your First Project" />
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

export const ProjectOverview = () => {
    return (
        <Card
            className=" rounded-sm w-full p-0"
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4 px-4 py-3 pb-0">
                    <h3 className="\ text-lg font-medium">
                        Project Overview
                    </h3>
                    <p className="flex items-center gap-1 text-muted-foreground text-sm hover:underline ">
                        <span className=' text-muted-foreground text-sm'>View all</span> <ArrowRightIcon className='size-4 text-muted-foreground' />
                    </p>
                </div>
                <Separator className='w-full' />
                <EmptyProject />
            </CardContent>

        </Card>
    )
};


export const RecentActivityTask = () => {
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
                <EmptyRecentActivityTask />
            </CardContent>

        </Card>
    )
};

export const MyTask = () => {
    return (
        <Card
            className=" rounded-sm w-full p-0"
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4 px-4 py-3 pb-0">
                    <div className=" flex items-center gap-2">
                        <Button size = "icon-sm"  variant={"shadow"} >
                            <User2Icon className=" text-primary" />
                        </Button>
                        <h3 className="\ text-sm font-medium">
                            My Task
                        </h3>
                    </div>
                    <Badge variant={"blue"} >
                        0
                    </Badge>
                </div>
                <Separator className='w-full' />
                <EmptyMyTask />
            </CardContent>

        </Card>
    )
}

export const Overdue = () => {
    return (
        <Card
            className=" rounded-sm w-full p-0"
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4 px-4 py-3 pb-0">
                    <div className=" flex items-center gap-2">
                        <Button size = "icon-sm"  variant={"shadow"} >
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
                <EmptyOverdue />
            </CardContent>

        </Card>
    )
}

export const InProgress = () => {
    return (
        <Card
            className=" rounded-sm w-full p-0"
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4 px-4 py-3 pb-0">
                    <div className=" flex items-center gap-2">
                        <Button size = "icon-sm" variant={"shadow"} >
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
                <EmptyInProgress />
            </CardContent>

        </Card>
    )
}