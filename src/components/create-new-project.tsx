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
import { MultipleSelect } from "@/components/ui/multiple-select";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ProjectPriority, ProjectStatus } from "@/generated/prisma";
import { Spinner } from "./ui/spinner";
import { useOrgMembers } from "@/features/organization-members/hooks/use-organization-members";
import { useState } from "react";

const NewProjectSchema = z.object({
    project_name: z.string().min(6, { message: "Project name must be 6 characters long" }),
    project_description: z.string().optional(),
    status: z.nativeEnum(ProjectStatus),
    priority: z.nativeEnum(ProjectPriority),
    state_date: z.date().optional(),
    end_date: z.date().optional(),
    project_lead: z.string(),
    team_members: z.array(z.string())
});

type NewProjectValue = z.infer<typeof NewProjectSchema>;

interface Props  {
    title? : string;
    organizationSlug?: string;
}

export const CreateNewProject = ({title = "New Project"} : Props) => {
    const {mutate: onCreateProject , isPending} = useCreateProject();
    const {data: membersList, isLoading} = useOrgMembers();

    const [open , setOpen] = useState(false)
    const {slug} = useParams();
    const form = useForm<NewProjectValue>({
        resolver: zodResolver(NewProjectSchema),
        defaultValues: {
            project_name: "",
            project_description: "",
            status: ProjectStatus.PLANNING,
            priority: ProjectPriority.MEDIUM,
            state_date: undefined,
            end_date: undefined,
            team_members: [],
            project_lead: "No lead"
        }
    });


    const onSubmit = (values: NewProjectValue) => {
        if (!slug) {
            toast.error("Select an organization before creating a project.");
            return;
        }

        onCreateProject(
            {
                name : values.project_name,
                description : values.project_description,
                status : values.status ,
                priority : values.priority ,
                startDate : values.state_date,
                endDate : values.end_date,
                members : values.team_members,
                projectLeadEmail : values.project_lead,
                organizationSlug: slug as string,
            },
            {
                onSuccess : () => {
                    form.reset();
                    setOpen(false);
                }
            }
        )
    }

    return (
        <Dialog open = {open} onOpenChange={setOpen}>
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
                                            {isLoading ? (
                                                <SelectItem value="No lead">
                                                    <Spinner className="text-muted-foreground" />
                                                </SelectItem>
                                            ) : membersList?.map(({email}) => (
                                                <SelectItem value={email}>{email}</SelectItem>
                                            ))}
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
                                    <FormControl>
                                        <MultipleSelect
                                            disabled = {isLoading}
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={membersList?.map(({email}) => ({
                                                label : email,
                                                value : email
                                            }))}
                                            placeholder="Select team"
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
                                {isPending ? (
                                    <>
                                        <Spinner/>

                                        Creating...
                                    </>
                                ) : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
