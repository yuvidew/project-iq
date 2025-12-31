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


export const CreateNewTaskForm = () => {
    const {open, setOpen} = useTaskForm();

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