"use client";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusIcon } from "lucide-react";
import z from "zod";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";

const NewProjectSchema = z.object({
    project_name: z.string().min(6, { message: "Project name must be 6 characters long" }),
    project_description: z.string().optional(),
    status: z.string(),
    priority: z.string(),
    state_date: z.date().optional(),
    end_date: z.date().optional(),
    project_lead: z.string(),
    team_members: z.string()
});

type NewProjectValue = z.infer<typeof NewProjectSchema>;

interface Props  {
    title? : string 
}

export const CreateNewProject = ({title = "New Project"} : Props) => {
    const form = useForm<NewProjectValue>({
        resolver: zodResolver(NewProjectSchema),
        defaultValues: {
            project_name: "",
            project_description: "",
            status: "planning",
            priority: "medium",
            state_date: undefined,
            end_date: undefined,
            team_members: "",
            project_lead: "No lead"

        }
    })

    const onSubmit = (values: NewProjectValue) => {
        console.log(values)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"default"}>
                    <PlusIcon />
                    {title}
                </Button>
            </DialogTrigger>
            <DialogContent className=" flex flex-col gap-8">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription className=" text-sm">
                        In workspace: <span className="text-primary">Yuvi</span>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="project_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Project name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="project_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea className=" h-28 resize-none" placeholder="description " {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
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
                                                <SelectItem value="planning">Planning</SelectItem>
                                                <SelectItem value="in_progress">In progress</SelectItem>
                                                <SelectItem value="blocked">Blocked</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
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
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="state_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start date</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                defaultDate={field.value}
                                                onSelectDate={field.onChange}
                                                placeholder="Select start date"
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End date</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                defaultDate={field.value}
                                                onSelectDate={field.onChange}
                                                placeholder="Select end date"
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="project_lead"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project lead</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select lead" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="No lead">No lead</SelectItem>
                                            <SelectItem value="Yuvi">Yuvi</SelectItem>
                                            <SelectItem value="Aisha">Aisha</SelectItem>
                                            <SelectItem value="Rohan">Rohan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="team_members"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team members</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select team" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Design">Design</SelectItem>
                                            <SelectItem value="Engineering">Engineering</SelectItem>
                                            <SelectItem value="QA">QA</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                            <Button type="submit">Create</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
