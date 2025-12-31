"use client"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
import { useTaskForm } from "../hooks/use-task-form";
import { useCreateTask } from "../hooks/use-task";
import { useParams } from "next/navigation";
import { TaskStatus } from "@/generated/prisma";
import { Spinner } from "@/components/ui/spinner";
import { useOrgMembers } from "@/features/organization-members/hooks/use-organization-members";

const CreateNewTaskSchema = z.object({
    name: z.string().min(4, {
        message: "Task name must be at least 4 characters"
    }),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus),
    assigneeId: z.string(),
    due_date: z.date().optional(),
});

type CreateNewTaskValue = z.infer<typeof CreateNewTaskSchema>;


export const CreateNewTaskForm = () => {
    const { open, setOpen } = useTaskForm();
    const { mutate: onCreateTask, isPending } = useCreateTask()
    const { data: membersList, isLoading } = useOrgMembers();

    const { id } = useParams<{ id: string }>();
    const form = useForm<CreateNewTaskValue>({
        resolver: zodResolver(CreateNewTaskSchema),
        defaultValues: {
            name: "",
            description: "",
            status: "TODO",
            assigneeId: "unassigned",
            due_date: undefined
        }
    });

    const onSubmit = (values: CreateNewTaskValue) => {
        onCreateTask(
            {
                name: values.name,
                description: values.description,
                status: values.status,
                assigneeId: values.assigneeId,
                projectId: id,
                dueDate: values.due_date,
                position: 0
            },
            {
                onSuccess: () => {
                    form.reset();
                    setOpen(false);
                }
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                                                <SelectItem value="BACKLOG">Backlog</SelectItem>
                                                <SelectItem value="TODO">To do</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                                                <SelectItem value="IN_REVIEW">In review</SelectItem>
                                                <SelectItem value="DONE">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="assigneeId"
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
                                                {isLoading ? (
                                                    <SelectItem value="No lead">
                                                        <Spinner className="text-muted-foreground" />
                                                    </SelectItem>
                                                ) : membersList?.map(({ email , id}) => (
                                                    <SelectItem value={id}>{email}</SelectItem>
                                                ))}
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
                            <DialogClose asChild disabled = {isPending}>
                                <Button type="button" variant="secondary" >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled = {isPending}>
                                {isPending ? (
                                    <>
                                        <Spinner />

                                        Creating...
                                    </>
                                ) : "Create Task"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )

};
