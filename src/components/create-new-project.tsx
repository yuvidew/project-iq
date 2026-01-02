"use client";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import z from "zod";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { MultipleSelect } from "@/components/ui/multiple-select";
import { useCreateProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ProjectPriority, ProjectStatus } from "@/generated/prisma";
import { Spinner } from "./ui/spinner";
import { useOrgMembers } from "@/features/organization-members/hooks/use-organization-members";
import { useProjectForm } from "@/features/projects/hooks/use-project-from";
import { useEffect, useMemo } from "react";

const NewProjectSchema = z.object({
    name: z.string().min(6, { message: "Project name must be 6 characters long" }),
    description: z.string().optional(),
    status: z.nativeEnum(ProjectStatus),
    priority: z.nativeEnum(ProjectPriority),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    projectLeadEmail: z.string(),
    members: z.array(z.string())
});

type NewProjectValue = z.infer<typeof NewProjectSchema>;



export const CreateNewProject = () => {
    const { mutate: onCreateProject, isPending } = useCreateProject();
    const { data: membersList, isLoading } = useOrgMembers();
    const { mutate: onUpdateProject, isPending: isUpdating } = useUpdateProject();
    const { open, setOpen, initialState, reset: resetProjectForm } = useProjectForm();
    const { slug } = useParams();

    const defaultValues = useMemo<NewProjectValue>(() => ({
        name: "",
        description: "",
        status: ProjectStatus.PLANNING,
        priority: ProjectPriority.MEDIUM,
        startDate: undefined,
        endDate: undefined,
        members: [],
        projectLeadEmail: "No lead",
    }), []);

    const form = useForm<NewProjectValue>({
        resolver: zodResolver(NewProjectSchema),
        defaultValues,
    });

    useEffect(() => {
        if (!initialState?.id) {
            form.reset(defaultValues);
            return;
        }

        form.reset({
            name: initialState.name ?? "",
            description: initialState.description ?? "",
            status: initialState.status ?? ProjectStatus.PLANNING,
            priority: initialState.priority ?? ProjectPriority.MEDIUM,
            startDate: initialState.startDate ? new Date(initialState.startDate) : undefined,
            endDate: initialState.endDate ? new Date(initialState.endDate) : undefined,
            members: initialState.members?.map((m) => m.email) ?? [],
            projectLeadEmail: initialState.projectLeadEmail ?? "No lead",
        });
    }, [defaultValues, form, initialState]);

    const isUpdateForm = Boolean(initialState?.id);
    const isSubmitting = isPending || isUpdating;

    const onSubmit = (values: NewProjectValue) => {
        if (!slug && !isUpdateForm) {
            toast.error("Select an organization before creating a project.");
            return;
        }

        const projectLeadEmail =
            values.projectLeadEmail && values.projectLeadEmail !== "No lead"
                ? values.projectLeadEmail
                : undefined;

        const basePayload = {
            name: values.name,
            description: values.description,
            status: values.status,
            priority: values.priority,
            startDate: values.startDate,
            endDate: values.endDate,
            members: values.members,
            projectLeadEmail,
        };

        if (isUpdateForm) {
            onUpdateProject(
                { ...basePayload, id: initialState.id as string },
                {
                    onSuccess: () => {
                        form.reset(defaultValues);
                        resetProjectForm();
                        setOpen(false);
                    },
                }
            );
            return;
        }

        onCreateProject(
            { ...basePayload, organizationSlug: slug as string },
            {
                onSuccess: () => {
                    form.reset(defaultValues);
                    resetProjectForm();
                    setOpen(false);
                },
            }
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    form.reset(defaultValues);
                    resetProjectForm();
                    return;
                }
                setOpen(nextOpen);
            }}
        >
            <DialogContent className=" flex flex-col gap-8">
                <DialogHeader>
                    <DialogTitle>
                        {isUpdateForm ? "Update Project" : "Create New Project"}
                    </DialogTitle>
                    <DialogDescription className=" hidden p-0">
                    </DialogDescription>
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
                            name="description"
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

                        <div className="grid gap-4 grid-cols-2">
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

                        <div className="grid gap-4 grid-cols-2">
                            <FormField
                                control={form.control}
                                name="startDate"
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
                                name="endDate"
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
                            name="projectLeadEmail"
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
                                            ) : membersList?.map(({email, id}) => (
                                                <SelectItem key={id} value={email}>{email}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="members"
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
                                {isSubmitting ? (
                                    <>
                                        <Spinner />
                                        {isUpdating ? "Saving..." : "Creating..."}
                                    </>
                                ) : isUpdateForm ? "Update Project" : "Create Project"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
