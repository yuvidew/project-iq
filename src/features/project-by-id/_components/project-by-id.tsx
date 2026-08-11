"use client";

import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeftIcon,
  BotMessageSquareIcon,
  CalendarIcon,
  Columns3Icon,
  ExternalLinkIcon,
  FileStackIcon,
  FileTextIcon,
  MessageSquareIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { DottedSeparator } from "@/components/dotted-separator";
import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { SearchBox } from "@/components/search_box";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BadgeTaskStatus } from "@/components/ui/badge-task-status";
import { BadgeText } from "@/components/ui/badge-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useOrgMembers } from "@/features/organization-members/hooks/use-organization-members";
import { ProjectAssistantPanel } from "@/features/project-assistant/_components/project-assistant-panel";
import { TaskStatus } from "@/generated/prisma";
import { PAGINATION } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useSuspenseProjectPerformance } from "../hooks/use-project-by-id";
import { useProjectTaskSearch } from "../hooks/use-project-task-search";
import { useRemoveTaskDialog } from "../hooks/use-remove-task-dialog";
import { useTaskParams } from "../hooks/use-taks-params";
import {
  useChangeTaskPositionStatus,
  useCreateTaskComment,
  useRemoveTask,
  useRemoveTaskComment,
  useSuspenseTasks,
  useTaskComments,
} from "../hooks/use-task";
import { useTaskDetails } from "../hooks/use-task-details";
import { useTaskForm } from "../hooks/use-task-form";
import type { ProjectsParams, Task } from "../types";
import { CreateNewTaskForm } from "./create-new-task";
import { DataCalendar } from "./data-calender";
import { DataKanban } from "./data-kanban";
import { DocumentLists } from "./document-list";
import { TaskTable } from "./task-table";

export const ProjectTaskErrorView = () => {
  return <ErrorView message="Error loading tasks of projects" />;
};

export const ProjectTaskLoadingView = () => {
  return <LoadingView message="Loading tasks of projects..." />;
};

interface ProjectAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const ProjectAvatar = ({
  name,
  className,
  fallbackClassName,
}: ProjectAvatarProps) => {
  return (
    <Avatar className={cn("size-5 rounded-md", className)}>
      <AvatarFallback
        className={cn(
          "text-white bg-blue-600 font-semibold text-sm uppercase rounded-md",
          fallbackClassName,
        )}
      >
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};

interface TaskDateProps {
  value: Date;
  className?: string;
}

export const TaskDate = ({ value, className }: TaskDateProps) => {
  const today = new Date();
  const endDate = new Date(value);
  const diffInDays = differenceInDays(endDate, today);

  let textColor = "text-muted-foreground";

  if (diffInDays <= 3) {
    textColor = "text-red-500";
  } else if (diffInDays <= 7) {
    textColor = "text-orange-500";
  } else if (diffInDays <= 14) {
    textColor = "text-yellow-500";
  }

  return (
    <div className={textColor}>
      <span className={cn("truncate", className)}>{format(value, "PPP")}</span>
    </div>
  );
};

const formatCommentSource = (source: string) => {
  return source.charAt(0) + source.slice(1).toLowerCase();
};

interface MemberAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const MemberAvatar = ({
  name,
  className,
  fallbackClassName,
}: MemberAvatarProps) => {
  return (
    <Avatar
      className={cn(
        "size-5 transition border border-neutral-300 rounded-full",
        className,
      )}
    >
      <AvatarFallback
        className={cn(
          "bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center",
          fallbackClassName,
        )}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

interface TaskCommentsProps {
  open: boolean;
  projectId?: string;
  taskId?: string;
}

const TaskComments = ({ open, projectId, taskId }: TaskCommentsProps) => {
  const [content, setContent] = useState("");
  const {
    data: comments = [],
    isError,
    isLoading,
  } = useTaskComments({
    enabled: open,
    projectId,
    taskId,
  });
  const { mutate: createComment, isPending: isCreating } =
    useCreateTaskComment();
  const { mutate: removeComment, isPending: isRemoving } =
    useRemoveTaskComment();

  const trimmedContent = content.trim();
  const canSubmit = Boolean(
    projectId && taskId && trimmedContent && !isCreating,
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!projectId || !taskId || !trimmedContent) {
      return;
    }

    createComment(
      {
        content: trimmedContent,
        projectId,
        taskId,
      },
      {
        onSuccess: () => {
          setContent("");
        },
      },
    );
  };

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Comments</h3>
        </div>
        <Badge variant="secondary">{comments.length}</Badge>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Add a comment..."
          maxLength={2000}
          className="min-h-20 resize-none text-sm"
          disabled={!projectId || !taskId || isCreating}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {trimmedContent.length}/2000
          </span>
          <Button type="submit" size="sm" disabled={!canSubmit}>
            {isCreating ? <Spinner /> : <SendIcon className="size-4" />}
            Add comment
          </Button>
        </div>
      </form>

      <DottedSeparator />

      <ScrollArea className="max-h-64 pr-3">
        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Spinner />
            Loading comments...
          </div>
        ) : isError ? (
          <p className="py-4 text-sm text-red-500">Unable to load comments.</p>
        ) : comments.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => {
              const authorName =
                comment.author.name ?? comment.author.email ?? "Unknown";
              const createdAt = new Date(comment.createdAt);
              const createdAtLabel = Number.isNaN(createdAt.getTime())
                ? ""
                : formatDistanceToNow(createdAt, { addSuffix: true });
              const createdAtTitle = Number.isNaN(createdAt.getTime())
                ? undefined
                : format(createdAt, "MMM d, yyyy h:mm a");

              return (
                <article
                  key={comment.id}
                  className="flex gap-3 rounded-md border bg-muted/20 p-3"
                >
                  <MemberAvatar
                    name={authorName}
                    fallbackClassName="text-[10px]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {authorName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {createdAtLabel && (
                            <time title={createdAtTitle}>{createdAtLabel}</time>
                          )}
                          <Badge
                            variant={
                              comment.source === "CHAT" ? "blue" : "outline"
                            }
                            className="px-1.5 py-0.5"
                          >
                            {formatCommentSource(comment.source)}
                          </Badge>
                        </div>
                      </div>
                      {comment.canDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={isRemoving}
                          onClick={() => {
                            if (!projectId || !taskId) {
                              return;
                            }

                            removeComment({
                              commentId: comment.id,
                              projectId,
                              taskId,
                            });
                          }}
                          aria-label="Delete comment"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                      {comment.content}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </section>
  );
};

const TaskDetail = () => {
  const { setOpen, open, initialState } = useTaskDetails();
  const taskStatus = initialState.status ?? TaskStatus.TODO;
  const assigneeName =
    initialState.assignee?.name ?? initialState.assignee?.email ?? "Unassigned";
  const projectName = initialState.project?.name ?? "Project";
  const dueDateValue = initialState.dueDate
    ? new Date(initialState.dueDate)
    : null;
  const dueDateLabel =
    dueDateValue && !Number.isNaN(dueDateValue.getTime())
      ? format(dueDateValue, "MMM dd, yyyy")
      : "No due date";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-2xl">
        <ScrollArea className="max-h-[calc(90vh-3rem)] pr-4">
          <div className="flex flex-col gap-4">
            <DialogHeader className=" flex flex-col items-start">
              <div className="flex items-start gap-2 pr-8">
                <DialogTitle>{initialState.name || "Task details"}</DialogTitle>

                <BadgeTaskStatus status={taskStatus} />
              </div>

              <DialogDescription className="text-muted-foreground text-left">
                {initialState.description || "No description"}
              </DialogDescription>
            </DialogHeader>

            <DottedSeparator />
            <div className="flex items-center gap-x-1.5">
              <MemberAvatar
                name={assigneeName}
                fallbackClassName="text-[10px]"
              />
              <div className="size-1 rounded-full bg-neutral-300" />
              <span className={cn("truncate text-xs")}>{dueDateLabel}</span>
            </div>
            <div className="flex items-center gap-x-1.5">
              <ProjectAvatar
                name={projectName}
                fallbackClassName="text-[10px]"
              />
              <span className="text-xs font-medium">{projectName}</span>
            </div>

            <DottedSeparator />
            <TaskComments
              open={open}
              projectId={initialState.projectId}
              taskId={initialState.id}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const SearchSection = () => {
  const [params, setParams] = useTaskParams() as [
    ProjectsParams,
    (p: ProjectsParams) => void,
  ];
  const { searchValue, onSearchChange } = useProjectTaskSearch({
    params,
    setParams,
  });

  const { data: membersList, isLoading } = useOrgMembers();

  const onUpdateFilter = <K extends keyof ProjectsParams>(
    key: K,
    value: ProjectsParams[K] | "ALL",
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
  };

  return (
    <div className="flex items-center gap-3 ">
      <SearchBox
        placeholder="Search task..."
        value={searchValue}
        onChange={onSearchChange}
      />
      <Select
        value={params.status ?? "ALL"}
        onValueChange={(val) =>
          onUpdateFilter("status", val as ProjectsParams["status"] | "ALL")
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Statues" />
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
        onValueChange={(val) =>
          onUpdateFilter(
            "assigneeId",
            val as ProjectsParams["assigneeId"] | "ALL",
          )
        }
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
          ) : (
            membersList?.map(({ email, id }) => (
              <SelectItem key={id} value={id}>
                {email}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

const TaskListPagination = () => {
  const { data, isFetching } = useSuspenseTasks();
  const [params, setParams] = useTaskParams();

  return (
    <Pagination
      disabled={isFetching}
      page={data.meta.page}
      totalPages={data.meta.totalPages}
      onPageChange={(page) =>
        setParams({
          ...params,
          page,
        })
      }
    />
  );
};

const RemoveTaskDialog = () => {
  const { open, setOpen, initialState } = useRemoveTaskDialog();

  const { mutate: onRemoveTask, isPending } = useRemoveTask();

  const onConfirmRemove = () => {
    onRemoveTask(
      {
        id: initialState.id as string,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete task "{initialState.name}"?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will permanently remove this task
            and its data from the project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onConfirmRemove}>
            {isPending ? (
              <>
                <Spinner />
                Removing...
              </>
            ) : (
              "Continue"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface TaskActionProps {
  initialState: { id: string; name: string };
  initialData: Task;
  children: ReactNode;
}

export const TaskActions = ({
  initialState,
  initialData,
  children,
}: TaskActionProps) => {
  const { setOpen, setInitialState } = useTaskForm();
  const {
    setOpen: setOpenRemoveDialog,
    setInitialState: setRemoveTaskInitialState,
  } = useRemoveTaskDialog();
  const { setOpen: setOpenTaskDetails, setInitialState: setTaskInitialState } =
    useTaskDetails();

  return (
    <div>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="font-medium p-2.5"
            onClick={() => {
              setOpenTaskDetails(true);
              setTaskInitialState(initialData);
            }}
          >
            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
            Task Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(true);
              setInitialState(initialData);
            }}
            className="font-medium p-2.5"
          >
            <PencilIcon className="size-4 mr-2 stroke-2" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpenRemoveDialog(true);
              setRemoveTaskInitialState(initialState);
            }}
            // disabled={isPending}
            className="text-amber-700 focus:text-amber-700 font-medium p-2.5"
          >
            <Trash2Icon className="size-4 mr-2 stroke-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const TaskTabs = ({ projectId }: { projectId: string }) => {
  const { data } = useSuspenseTasks();
  const { mutate: onChangeTaskPositionStatus } = useChangeTaskPositionStatus();

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
        <TabsTrigger value="document" className=" px-5">
          <FileTextIcon className=" size-4" />
          Document
        </TabsTrigger>
        <TabsTrigger value="assistant" className=" px-5">
          <BotMessageSquareIcon className=" size-4" />
          Assistant
        </TabsTrigger>
      </TabsList>
      <TabsContent value="task">
        <TaskTable
          searchFilter={<SearchSection />}
          pagination={<TaskListPagination />}
          taskList={data.tasks}
        />
      </TabsContent>
      <TabsContent value="kanban" className="bg-card">
        <DataKanban
          data={data.tasks}
          onChange={(updates) => onChangeTaskPositionStatus({ updates })}
        />
      </TabsContent>
      <TabsContent value="calender">
        <DataCalendar data={data.tasks} />
      </TabsContent>
      <TabsContent value="document">
        <DocumentLists />
      </TabsContent>
      <TabsContent value="assistant">
        <ProjectAssistantPanel projectId={projectId} />
      </TabsContent>
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

            <h4 className=" text-xl">{data.project.name}</h4>

            <BadgeText status={data.project.status} />
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
        <TaskTabs projectId={data.project.id} />
        {/* end to tabs */}
      </main>

      {/* start to create new task */}
      <CreateNewTaskForm />
      {/* end to create new task */}

      {/* start to remove task dialog */}
      <RemoveTaskDialog />
      {/* end to remove task dialog */}

      {/* start to task details */}
      <TaskDetail />
      {/* end to task details */}
    </>
  );
};
