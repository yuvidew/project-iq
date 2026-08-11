"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangleIcon,
  BotMessageSquareIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  MessageSquareIcon,
  PlusIcon,
  SendIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { BadgeTaskStatus } from "@/components/ui/badge-task-status";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AssistantResponseType,
  ChatMessageRole,
  type TaskStatus,
} from "@/generated/prisma";
import { cn } from "@/lib/utils";
import type { AppRouter } from "@/server/router";
import {
  useProjectAssistantMessages,
  useProjectAssistantSessions,
  useSendProjectAssistantMessage,
} from "../hooks/use-project-assistant";
import {
  type ProjectAssistantResponse,
  projectAssistantResponseSchema,
} from "../types";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type AssistantSession =
  RouterOutputs["projectAssistant"]["getSessions"][number];
type AssistantMessage =
  RouterOutputs["projectAssistant"]["getMessages"][number];

type AssistantTone = "default" | "success" | "warning" | "danger" | "info";

const SUGGESTED_PROMPTS = [
  "How many tasks are pending?",
  "Show overdue tasks",
  "What's the project progress?",
  "List recent comments",
  "Show project documents",
];

const toneClassNames: Record<AssistantTone, string> = {
  default: "border-border bg-background",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  danger: "border-red-200 bg-red-50 text-red-950",
  info: "border-blue-200 bg-blue-50 text-blue-950",
};

const statusColors: Record<TaskStatus, string> = {
  BACKLOG: "#64748b",
  TODO: "#f59e0b",
  IN_PROGRESS: "#2563eb",
  IN_REVIEW: "#9333ea",
  DONE: "#059669",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const getDate = (value: unknown) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

const formatMessageTime = (value: unknown) => {
  const date = getDate(value);

  return date ? format(date, "MMM d, h:mm a") : "";
};

const formatRelativeTime = (value: unknown) => {
  const date = getDate(value);

  return date ? formatDistanceToNow(date, { addSuffix: true }) : "";
};

const getAssistantResponseFromMessage = (
  message: AssistantMessage,
): ProjectAssistantResponse => {
  const metadata = isRecord(message.metadata) ? message.metadata : {};
  const candidate = {
    type: message.responseType,
    intent: getString(metadata.intent) ?? "assistant_response",
    answer: message.content,
    payload: isRecord(metadata.payload)
      ? metadata.payload
      : {
          title: "Assistant response",
          items: [],
        },
  };
  const parsed = projectAssistantResponseSchema.safeParse(candidate);

  if (parsed.success) {
    return parsed.data;
  }

  return {
    type: AssistantResponseType.TEXT,
    intent: "assistant_response",
    answer: message.content,
    payload: {
      title: "Assistant response",
      items: [],
    },
  };
};

const getItemTitle = (item: Record<string, unknown>) =>
  getString(item.title) ??
  getString(item.name) ??
  getString(item.content) ??
  "Item";

const renderSimpleValue = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null) {
    return "None";
  }

  return null;
};

const AssistantSummaryCards = ({
  response,
}: {
  response: Extract<
    ProjectAssistantResponse,
    { type: typeof AssistantResponseType.SUMMARY_CARDS }
  >;
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {response.payload.cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "rounded-sm border p-3",
              toneClassNames[card.tone ?? "default"],
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                {card.label}
              </p>
              {card.tone === "success" ? (
                <CheckCircle2Icon className="size-4 text-emerald-600" />
              ) : (
                <SparklesIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-normal">
              {card.value}
            </p>
            {card.description ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {card.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {response.payload.statusSegments.length > 0 ? (
        <StatusSegments segments={response.payload.statusSegments} />
      ) : null}
    </div>
  );
};

const StatusSegments = ({
  segments,
}: {
  segments: Extract<
    ProjectAssistantResponse,
    { type: typeof AssistantResponseType.SUMMARY_CARDS }
  >["payload"]["statusSegments"];
}) => {
  return (
    <div className="space-y-2 rounded-sm border p-3">
      {segments.map((segment) => (
        <div key={segment.status} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium">{segment.label}</span>
            <span className="text-muted-foreground">
              {segment.value} task{segment.value === 1 ? "" : "s"} (
              {segment.percentage}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor: statusColors[segment.status],
                width: `${segment.percentage}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const AssistantTaskTable = ({
  response,
}: {
  response: Extract<
    ProjectAssistantResponse,
    { type: typeof AssistantResponseType.TASK_TABLE }
  >;
}) => {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">{response.payload.title}</h4>
        {response.payload.description ? (
          <p className="text-xs text-muted-foreground">
            {response.payload.description}
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="text-right">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {response.payload.tasks.length > 0 ? (
              response.payload.tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="min-w-52 whitespace-normal">
                    <div className="font-medium">{task.name}</div>
                    {task.description ? (
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {task.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <BadgeTaskStatus status={task.status} />
                  </TableCell>
                  <TableCell className="min-w-36 whitespace-normal">
                    {task.assignee?.displayName ?? "Unassigned"}
                  </TableCell>
                  <TableCell className="min-w-32">
                    {task.dueDate
                      ? (formatMessageTime(task.dueDate).split(",")[0] ??
                        task.dueDate)
                      : "No due date"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {task.commentCount}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-20 text-center text-muted-foreground"
                >
                  No matching tasks.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {response.payload.meta.returned} of{" "}
        {response.payload.meta.total}.
      </p>
    </div>
  );
};

const AssistantProgressChart = ({
  response,
}: {
  response: Extract<
    ProjectAssistantResponse,
    { type: typeof AssistantResponseType.PROGRESS_CHART }
  >;
}) => {
  const chartData = response.payload.statusSegments.map((segment) => ({
    color: statusColors[segment.status],
    status: segment.label,
    value: segment.value,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div className="rounded-sm border p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Completion
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-normal">
            {response.payload.completionPercentage}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {response.payload.completedTasks} of {response.payload.totalTasks}{" "}
            done
          </p>
        </div>
        <div className="rounded-sm border p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold">{response.payload.title}</h4>
            <Badge variant="secondary">
              {response.payload.totalTasks} total
            </Badge>
          </div>
          <div className="h-3 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{
                width: `${response.payload.completionPercentage}%`,
              }}
            />
          </div>
          {chartData.length > 0 ? (
            <ChartContainer
              config={{ value: { label: "Tasks" } }}
              className="mt-4 h-56 w-full"
            >
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ left: -18, right: 8, top: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const AssistantTextItems = ({
  response,
}: {
  response: Extract<
    ProjectAssistantResponse,
    {
      type:
        | typeof AssistantResponseType.TEXT
        | typeof AssistantResponseType.ERROR;
    }
  >;
}) => {
  const items = response.payload.items;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{response.payload.title}</h4>
      <div className="grid gap-2">
        {items.map((item, index) => (
          <TextItemCard
            key={getString(item.id) ?? `${response.intent}-${index}`}
            item={item}
          />
        ))}
      </div>
    </div>
  );
};

const TextItemCard = ({ item }: { item: Record<string, unknown> }) => {
  const author = isRecord(item.author) ? item.author : null;
  const task = isRecord(item.task) ? item.task : null;
  const createdAtLabel = formatRelativeTime(item.createdAt);
  const content = getString(item.content);
  const documentName = getString(item.name);

  if (content || task || author) {
    return (
      <article className="rounded-sm border p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words text-sm font-medium">
              {task ? (getString(task.name) ?? "Task comment") : "Task comment"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {author
                ? (getString(author.displayName) ?? getString(author.email))
                : ""}
              {createdAtLabel ? ` - ${createdAtLabel}` : ""}
            </p>
          </div>
          {task && getString(task.status) ? (
            <BadgeTaskStatus status={getString(task.status) as TaskStatus} />
          ) : null}
        </div>
        {content ? (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
            {content}
          </p>
        ) : null}
      </article>
    );
  }

  if (documentName) {
    return (
      <article className="flex items-center justify-between gap-3 rounded-sm border p-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
          <p className="truncate text-sm font-medium">{documentName}</p>
        </div>
        {createdAtLabel ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {createdAtLabel}
          </span>
        ) : null}
      </article>
    );
  }

  return (
    <article className="rounded-sm border p-3">
      <p className="break-words text-sm font-medium">{getItemTitle(item)}</p>
      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
        {Object.entries(item).map(([key, value]) => {
          const renderedValue = renderSimpleValue(value);

          return renderedValue ? (
            <div key={key} className="flex gap-2">
              <span className="font-medium">{key}</span>
              <span>{renderedValue}</span>
            </div>
          ) : null;
        })}
      </div>
    </article>
  );
};

const AssistantActionConfirmation = ({
  response,
}: {
  response: Extract<
    ProjectAssistantResponse,
    { type: typeof AssistantResponseType.ACTION_CONFIRMATION }
  >;
}) => {
  const payload = response.payload.payload;
  const task = isRecord(payload.task) ? payload.task : null;
  const comment = isRecord(payload.comment) ? payload.comment : null;

  return (
    <div className="space-y-3 rounded-sm border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-amber-950">
            {response.payload.title}
          </h4>
          <p className="mt-1 text-xs text-amber-900">
            {response.payload.description}
          </p>
        </div>
        <Badge variant="secondary">Draft</Badge>
      </div>

      <div className="grid gap-2 text-sm text-amber-950">
        {task ? (
          <div className="rounded-sm bg-background/80 p-3">
            <p className="text-xs font-medium text-muted-foreground">Task</p>
            <p className="mt-1 break-words font-medium">
              {getString(task.name) || "Untitled task"}
            </p>
            {getString(task.status) ? (
              <div className="mt-2">
                <BadgeTaskStatus
                  status={getString(task.status) as TaskStatus}
                />
              </div>
            ) : null}
          </div>
        ) : null}
        {comment ? (
          <div className="rounded-sm bg-background/80 p-3">
            <p className="text-xs font-medium text-muted-foreground">Comment</p>
            <p className="mt-1 whitespace-pre-wrap break-words">
              {getString(comment.content) || "Empty comment"}
            </p>
          </div>
        ) : null}
      </div>

      {response.payload.warnings.length > 0 ? (
        <div className="grid gap-2">
          {response.payload.warnings.map((warning) => (
            <div
              key={warning}
              className="flex items-start gap-2 rounded-sm border border-amber-300 bg-background/80 p-2 text-xs text-amber-950"
            >
              <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="button" size="sm" disabled>
          Confirm
        </Button>
      </div>
    </div>
  );
};

const AssistantResponse = ({
  response,
}: {
  response: ProjectAssistantResponse;
}) => {
  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap break-words text-sm leading-6">
        {response.answer}
      </p>

      {response.type === AssistantResponseType.SUMMARY_CARDS ? (
        <AssistantSummaryCards response={response} />
      ) : null}

      {response.type === AssistantResponseType.TASK_TABLE ? (
        <AssistantTaskTable response={response} />
      ) : null}

      {response.type === AssistantResponseType.PROGRESS_CHART ? (
        <AssistantProgressChart response={response} />
      ) : null}

      {response.type === AssistantResponseType.TEXT ||
      response.type === AssistantResponseType.ERROR ? (
        <AssistantTextItems response={response} />
      ) : null}

      {response.type === AssistantResponseType.ACTION_CONFIRMATION ? (
        <AssistantActionConfirmation response={response} />
      ) : null}
    </div>
  );
};

const SessionButton = ({
  active,
  disabled,
  onClick,
  session,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  session: AssistantSession;
}) => {
  const updatedAt = formatRelativeTime(session.updatedAt);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-sm border p-3 text-left transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60",
        active && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-2 text-sm font-medium">
          {session.title || "Project assistant"}
        </p>
        <MessageSquareIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{session._count.messages} messages</span>
        {updatedAt ? (
          <>
            <span className="size-1 rounded-full bg-muted-foreground/50" />
            <span>{updatedAt}</span>
          </>
        ) : null}
      </div>
    </button>
  );
};

const AssistantMessageBubble = ({ message }: { message: AssistantMessage }) => {
  const isUser = message.role === ChatMessageRole.USER;
  const isAssistant = message.role === ChatMessageRole.ASSISTANT;
  const createdAtLabel = formatMessageTime(message.createdAt);
  const response = isAssistant
    ? getAssistantResponseFromMessage(message)
    : null;

  return (
    <article
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser ? (
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-sm border bg-background">
          <BotMessageSquareIcon className="size-4 text-primary" />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[min(760px,100%)] rounded-sm border p-3",
          isUser
            ? "border-primary bg-primary text-primary-foreground"
            : "bg-background",
        )}
      >
        <div className="mb-2 flex items-center gap-2 text-xs opacity-80">
          {isUser ? (
            <UserIcon className="size-3.5" />
          ) : (
            <SparklesIcon className="size-3.5" />
          )}
          <span>{isUser ? "You" : "Assistant"}</span>
          {createdAtLabel ? (
            <>
              <span className="size-1 rounded-full bg-current" />
              <time>{createdAtLabel}</time>
            </>
          ) : null}
        </div>
        {response ? (
          <AssistantResponse response={response} />
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.content}
          </p>
        )}
      </div>
    </article>
  );
};

const PendingMessage = ({ content }: { content: string }) => {
  return (
    <>
      <article className="flex justify-end gap-3">
        <div className="max-w-[min(760px,100%)] rounded-sm border border-primary bg-primary p-3 text-primary-foreground">
          <div className="mb-2 flex items-center gap-2 text-xs opacity-80">
            <UserIcon className="size-3.5" />
            <span>You</span>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {content}
          </p>
        </div>
      </article>
      <article className="flex justify-start gap-3">
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-sm border bg-background">
          <BotMessageSquareIcon className="size-4 text-primary" />
        </div>
        <div className="rounded-sm border bg-background p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Thinking...
          </div>
        </div>
      </article>
    </>
  );
};

export const ProjectAssistantPanel = ({ projectId }: { projectId: string }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [draft, setDraft] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const initializedSessionRef = useRef(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const {
    data: sessions = [],
    isError: sessionsError,
    isLoading: sessionsLoading,
  } = useProjectAssistantSessions({ projectId });
  const {
    data: messages = [],
    isError: messagesError,
    isFetching: messagesFetching,
    isLoading: messagesLoading,
  } = useProjectAssistantMessages({
    enabled: Boolean(selectedSessionId),
    projectId,
    sessionId: selectedSessionId,
  });
  const { mutate: sendMessage, isPending: sendingMessage } =
    useSendProjectAssistantMessage();

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId),
    [selectedSessionId, sessions],
  );
  const canSend = Boolean(draft.trim()) && !sendingMessage;

  useEffect(() => {
    if (initializedSessionRef.current || sessions.length === 0) {
      return;
    }

    setSelectedSessionId(sessions[0]?.id);
    initializedSessionRef.current = true;
  }, [sessions]);

  useEffect(() => {
    const shouldScroll = messages.length > 0 || Boolean(pendingMessage);
    const element = messageListRef.current;

    if (!element || !shouldScroll) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }, [messages.length, pendingMessage]);

  const sendText = (value: string) => {
    const message = value.trim();

    if (!message || sendingMessage) {
      return;
    }

    setPendingMessage(message);
    setDraft("");
    sendMessage(
      {
        message,
        projectId,
        ...(selectedSessionId ? { sessionId: selectedSessionId } : {}),
      },
      {
        onError: () => {
          setDraft(message);
        },
        onSettled: () => {
          setPendingMessage(null);
        },
        onSuccess: (data) => {
          initializedSessionRef.current = true;
          setSelectedSessionId(data.session.id);
        },
      },
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendText(draft);
  };

  return (
    <section className="grid gap-4 pt-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-sm border bg-background">
        <div className="flex items-center justify-between gap-3 border-b p-3">
          <div className="flex items-center gap-2">
            <ClockIcon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">History</h3>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={sendingMessage}
            onClick={() => {
              initializedSessionRef.current = true;
              setSelectedSessionId(undefined);
            }}
            aria-label="New assistant chat"
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
        <div className="max-h-[520px] space-y-2 overflow-y-auto p-3">
          {sessionsLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Spinner />
              Loading chats...
            </div>
          ) : sessionsError ? (
            <p className="py-4 text-sm text-red-500">
              Unable to load assistant history.
            </p>
          ) : sessions.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No assistant chats yet.
            </p>
          ) : (
            sessions.map((session) => (
              <SessionButton
                key={session.id}
                active={session.id === selectedSessionId}
                disabled={sendingMessage}
                session={session}
                onClick={() => {
                  initializedSessionRef.current = true;
                  setSelectedSessionId(session.id);
                }}
              />
            ))
          )}
        </div>
      </aside>

      <div className="flex min-h-[620px] flex-col rounded-sm border bg-background">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BotMessageSquareIcon className="size-5 text-primary" />
              <h3 className="truncate text-base font-semibold">
                {activeSession?.title || "Project assistant"}
              </h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedSessionId
                ? `${messages.length} message${messages.length === 1 ? "" : "s"}`
                : "New chat"}
            </p>
          </div>
          {messagesFetching && selectedSessionId ? (
            <Badge variant="secondary">
              <Spinner />
              Syncing
            </Badge>
          ) : null}
        </div>

        <div
          ref={messageListRef}
          className="flex-1 space-y-4 overflow-y-auto p-4"
        >
          {messagesLoading && selectedSessionId ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Spinner />
              Loading messages...
            </div>
          ) : messagesError ? (
            <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Unable to load assistant messages.
            </div>
          ) : messages.length === 0 && !pendingMessage ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-sm border bg-muted">
                <SparklesIcon className="size-5 text-primary" />
              </div>
              <h4 className="mt-4 text-base font-semibold">
                Ask about this project
              </h4>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={sendingMessage}
                    onClick={() => sendText(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <AssistantMessageBubble key={message.id} message={message} />
              ))}
              {pendingMessage ? (
                <PendingMessage content={pendingMessage} />
              ) : null}
            </>
          )}
        </div>

        <form onSubmit={onSubmit} className="border-t p-4">
          <div className="flex flex-col gap-3">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendText(draft);
                }
              }}
              placeholder="Ask about tasks, progress, comments, or documents..."
              maxLength={4000}
              className="min-h-24 resize-none text-sm"
              disabled={sendingMessage}
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {draft.trim().length}/4000
              </span>
              <Button type="submit" disabled={!canSend}>
                {sendingMessage ? <Spinner /> : <SendIcon className="size-4" />}
                Send
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
