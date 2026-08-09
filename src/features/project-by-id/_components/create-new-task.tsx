"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useOrgMembers } from "@/features/organization-members/hooks/use-organization-members";
import { TaskStatus } from "@/generated/prisma";
import { useCreateTask, useUpdateTask } from "../hooks/use-task";
import { useTaskForm } from "../hooks/use-task-form";

const CreateNewTaskSchema = z.object({
  name: z.string().min(4, {
    message: "Task name must be at least 4 characters",
  }),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  assigneeId: z.string(),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  end_date: z.date().optional(),
});

type CreateNewTaskValue = z.infer<typeof CreateNewTaskSchema>;

export const CreateNewTaskForm = () => {
  const { open, setOpen, initialState, reset } = useTaskForm();

  const { mutate: onCreateTask, isPending } = useCreateTask();
  const { mutate: onUpdateTask, isPending: isUpdating } = useUpdateTask();

  const { data: membersList, isLoading } = useOrgMembers();

  const { id } = useParams<{ id: string }>();
  const form = useForm<CreateNewTaskValue>({
    resolver: zodResolver(CreateNewTaskSchema),
    defaultValues: {
      name: initialState?.name || "",
      description: initialState?.description || "",
      status: initialState?.status || "TODO",
      assigneeId: initialState?.assigneeId || "unassigned",
      start_date: initialState?.startDate || undefined,
      due_date: initialState?.dueDate || undefined,
      end_date: initialState?.endDate || undefined,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialState?.name || "",
      description: initialState?.description || "",
      status: initialState?.status || "TODO",
      assigneeId: initialState?.assigneeId || "unassigned",
      start_date: initialState?.startDate || undefined,
      due_date: initialState?.dueDate || undefined,
      end_date: initialState?.endDate || undefined,
    });
  }, [initialState, form]);

  const isUpdateForm = Boolean(initialState?.id);
  const isSubmitting = isPending || isUpdating;

  const onSubmit = (values: CreateNewTaskValue) => {
    const taskId = initialState?.id;

    if (taskId) {
      onUpdateTask(
        {
          id: taskId,
          name: values.name,
          description: values.description,
          status: values.status,
          assigneeId:
            values.assigneeId === "unassigned" ? null : values.assigneeId,
          projectId: id,
          startDate: values.start_date,
          dueDate: values.due_date,
          endDate: values.end_date,
        },
        {
          onSuccess: () => {
            form.reset();
            reset();
            setOpen(false);
          },
        },
      );

      return;
    }
    onCreateTask(
      {
        name: values.name,
        description: values.description,
        status: values.status,
        assigneeId:
          values.assigneeId === "unassigned" ? null : values.assigneeId,
        projectId: id,
        startDate: values.start_date,
        dueDate: values.due_date,
        endDate: values.end_date,
        position: 0,
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className=" flex flex-col gap-6">
        <DialogHeader>
          <DialogTitle>
            {isUpdateForm ? "Update Task" : "Create new Task"}
          </DialogTitle>
          <DialogDescription className=" hidden"></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Textarea
                      className=" h-28 resize-none"
                      placeholder="Task description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=" grid grid-cols-2 gap-4">
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
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {isLoading ? (
                          <SelectItem value="No lead">
                            <Spinner className="text-muted-foreground" />
                          </SelectItem>
                        ) : (
                          membersList?.map(({ email, id }) => (
                            <SelectItem key={id} value={id}>
                              {email}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="start_date"
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

            <div className="flex justify-end gap-2">
              <DialogClose asChild disabled={isSubmitting}>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner />
                    {isUpdating ? "Saving..." : "Creating..."}
                  </>
                ) : isUpdateForm ? (
                  "Update Task"
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
