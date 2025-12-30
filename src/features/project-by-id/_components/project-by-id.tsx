"use client";
import { useState } from 'react';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowLeftIcon, CalendarIcon, ChartColumnIcon, CheckCircleIcon, ClockIcon, FileStackIcon, FolderOpenIcon, PlusIcon, SettingsIcon, TriangleAlertIcon, UsersIcon, ZapIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BadgeText } from '@/components/ui/badge-text';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskTable } from './task-table';
import { TaskByStatus } from './task-by-status';
import { TaskByType } from './task-by-type';




const CreateNewTaskSchema = z.object({
    name: z.string().min(4, {
        message: "Task name must be 6 characters long"
    }),
    description: z.string().optional(),
    status: z.string(),//TODO: change to native enum
    priority: z.string(),//TODO: change to native enum
    assignee: z.string(),
    type: z.string(),//TODO: change to native enum
    due_date: z.date(),
});

type CreateNewTaskValue = z.infer<typeof CreateNewTaskSchema>;

interface CreateNewTaskFormProps {
    title?: string
}

export const CreateNewTaskForm = ({
    title = "New Project"
}: CreateNewTaskFormProps) => {
    const [open, setOpen] = useState(false);

    const form = useForm<CreateNewTaskValue>({
        resolver: zodResolver(CreateNewTaskSchema),
        defaultValues: {
            name: "",
            description: "",
            status: "",
            priority: "",
            type: "",
            assignee: "unassigned",
            due_date: undefined
        }
    });

    const onSubmit = () => { }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button >
                    <PlusIcon className=' size-5' /> {title}
                </Button>
            </DialogTrigger>
            <DialogContent className=' flex flex-col gap-6'>
                <DialogHeader>
                    <DialogTitle>Create new Task</DialogTitle>
                    <DialogDescription className=' hidden'></DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Task title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea className=" h-28 resize-none" placeholder="Task description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className=' grid grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PLANNING">Planning</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                                                <SelectItem value="BLOCKED">Blocked</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PLANNING">Planning</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assignee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignee</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select assigned" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="unassigned">
                                                    Unassigned
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="due_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Due date</FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            defaultDate={field.value}
                                            onSelectDate={field.onChange}
                                            placeholder="Select due date"
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit">
                                {/* {isPending ? (
                                        <>
                                            <Spinner />

                                            Creating...
                                        </>
                                    ) : "Create"} */}
                                Create Task
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )

};

const AnalyticsComp = () => {
    return (
        <section className=' w-full  flex flex-col gap-3 py-4'>
            {/* start to complete count*/}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 ">
                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-green-500 text-sm font-medium">
                                Completed Rate
                            </h3>
                            <p className="text-4xl font-bold ">
                                0
                            </p>
                        </div>
                            <CheckCircleIcon className={`size-5 text-green-500`} />
                    </CardContent>
                </Card>

                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-blue-500 text-sm font-medium">
                                Total Task
                            </h3>
                            <p className="text-4xl font-bold ">
                                0
                            </p>
                        </div>
                        <ClockIcon className={`size-5 text-blue-500`} />
                    </CardContent>
                </Card>

                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-red-500 text-sm font-medium">
                                Overdue task
                            </h3>
                            <p className="text-4xl font-bold ">
                                0
                            </p>
                        </div>
                        <TriangleAlertIcon className={`size-5 text-red-500`} />
                    </CardContent>
                </Card>

                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-2 ">
                            <h3 className="text-indigo-400 text-sm font-medium">
                                Team Size
                            </h3>
                            <p className="text-4xl font-bold ">
                                0
                            </p>
                        </div>
                        <UsersIcon className={`size-5 text-indigo-500`} />
                    </CardContent>
                </Card>
            </div>
            {/* end to complete count*/}

            {/* start to chart bars */}
            <div className=' grid lg:grid-cols-2 gap-3'>
                <TaskByStatus/>
                <TaskByType/>

                
            </div> 
            {/* end to chart bars */}
        </section>
    )
}

export const TaskTabs = () => {
    return (
        <Tabs defaultValue="task" className="w-full ">
            <TabsList className='p-0 rounded-sm'>
                <TabsTrigger value="task" className=' px-5'>
                    <FileStackIcon className=' size-4' />
                    Task
                </TabsTrigger>
                <TabsTrigger value="calender" className=' px-5'>
                    <CalendarIcon className=' size-4' />
                    Calendar
                </TabsTrigger>
                <TabsTrigger value="analytics" className=' px-5'>
                    <ChartColumnIcon className=' size-4' />
                    Analytics
                </TabsTrigger>
                <TabsTrigger value="setting" className=' px-5'>
                    <SettingsIcon className=' size-4' />
                    Setting
                </TabsTrigger>
            </TabsList>
            <TabsContent value="task">
                <TaskTable />
            </TabsContent>
            <TabsContent value="calender">TODO: create calendar comp</TabsContent>
            <TabsContent value="analytics">
                <AnalyticsComp/>
            </TabsContent>
            <TabsContent value="setting">Change your password here.</TabsContent>
        </Tabs>
    )
}

export const ProjectIdView = () => {
    const navigate = useRouter();
    return (
        <main className=" p-6 flex flex-col gap-6 ">
            {/* start to header */}
            <section className=' flex items-center justify-between'>
                <div className=' flex items-center gap-5'>
                    <ArrowLeftIcon
                        className=' size-5 cursor-pointer'
                        onClick={() => navigate.back()}
                    />

                    <h4 className=' text-xl'>Project name</h4>

                    <BadgeText status="ACTIVE" />
                </div>

                <CreateNewTaskForm />
            </section>
            {/* end to header */}

            {/* start to total progress count */}
            {/* TODO: add the data and show the all total count */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-blue-500 text-sm font-medium">
                                Total Task
                            </h3>
                            <ZapIcon className={`size-5 text-blue-500`} />
                        </div>
                        <p className="text-4xl font-bold ">
                            0
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-green-500 text-sm font-medium">
                                Completed Projects
                            </h3>
                            <ZapIcon className={`size-5 text-green-500`} />
                        </div>
                        <p className="text-4xl font-bold ">
                            0
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-yellow-500 text-sm font-medium">
                                In Progress
                            </h3>
                            <ZapIcon className={`size-5 text-yellow-500`} />
                        </div>
                        <p className="text-4xl font-bold ">
                            0
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-indigo-400 text-sm font-medium">
                                Team Members
                            </h3>
                            <ZapIcon className={`size-5 text-indigo-500`} />
                        </div>
                        <p className="text-4xl font-bold ">
                            0
                        </p>
                    </CardContent>
                </Card>
            </section>
            {/* end to total progress count */}

            {/* start to tabs */}
            <TaskTabs />
            {/* end to tabs */}
        </main>
    )
}
