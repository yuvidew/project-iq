import { TRPCError } from "@trpc/server";
import z from "zod";
import {
  AssistantResponseType,
  ChatMessageRole,
  OrganizationRole,
  type Prisma,
  ProjectMemberRole,
  TaskStatus,
} from "@/generated/prisma";
import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";
import {
  type ProjectAssistantResponse,
  type ProjectAssistantTaskRow,
  projectAssistantResponseSchema,
} from "../types";

const TASK_LIST_LIMIT = 20;
const RECENT_COMMENT_LIMIT = 10;
const DOCUMENT_LIMIT = 20;

const taskStatusOrder = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
] as const;

const taskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "Backlog",
  [TaskStatus.TODO]: "Todo",
  [TaskStatus.IN_PROGRESS]: "In progress",
  [TaskStatus.IN_REVIEW]: "In review",
  [TaskStatus.DONE]: "Done",
};

type ProjectForAssistant = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: Date | null;
  endDate: Date | null;
  organizationSlug: string;
  projectLeadEmail: string | null;
};

type AssistantIntent =
  | "project_overview"
  | "task_counts"
  | "task_list"
  | "project_progress"
  | "status_distribution"
  | "recent_comments"
  | "project_documents"
  | "draft_create_task"
  | "draft_create_task_comment";

type TaskListFilters = {
  assigneeId?: string;
  assigneeLabel?: string;
  dueDateLabel?: string;
  dueDateRange?: {
    gte?: Date;
    lte?: Date;
    lt?: Date;
  };
  search?: string;
  status?: TaskStatus;
  statusNot?: TaskStatus;
};

const projectAssistantInput = z.object({
  projectId: z.string(),
});

const sessionInput = projectAssistantInput.extend({
  sessionId: z.string(),
});

const createSessionTitle = (message: string) => {
  const normalized = message.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "Project assistant";
  }

  return normalized.length > 64
    ? `${normalized.slice(0, 61).trim()}...`
    : normalized;
};

const normalizeText = (value: string) => value.toLowerCase().trim();

const includesAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(term));

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const detectTaskStatus = (text: string): TaskStatus | undefined => {
  const normalized = normalizeText(text);

  const statusPatterns: Array<[TaskStatus, RegExp[]]> = [
    [
      TaskStatus.IN_PROGRESS,
      [/\bin progress\b/, /\bin-progress\b/, /\bworking\b/, /\bactive\b/],
    ],
    [
      TaskStatus.IN_REVIEW,
      [/\bin review\b/, /\bin-review\b/, /\breview\b/, /\breviewing\b/],
    ],
    [TaskStatus.BACKLOG, [/\bbacklog\b/, /\blater\b/]],
    [TaskStatus.DONE, [/\bdone\b/, /\bcompleted\b/, /\bcomplete\b/]],
    [TaskStatus.TODO, [/\btodo\b/, /\bto do\b/, /\bpending\b/, /\bopen\b/]],
  ];

  return statusPatterns.find(([, patterns]) =>
    patterns.some((pattern) => pattern.test(normalized)),
  )?.[0];
};

const detectIntent = (message: string): AssistantIntent => {
  const text = normalizeText(message);
  const asksForTaskWrite =
    includesAny(text, ["create task", "add task", "make task", "new task"]) &&
    !includesAny(text, ["list", "show", "find", "search"]);
  const asksForCommentWrite =
    includesAny(text, [
      "add comment",
      "create comment",
      "leave comment",
      "write comment",
    ]) || /\bcomment\b.*\bon task\b/.test(text);

  if (asksForTaskWrite) {
    return "draft_create_task";
  }

  if (asksForCommentWrite) {
    return "draft_create_task_comment";
  }

  if (includesAny(text, ["comment", "comments", "activity", "notes"])) {
    return "recent_comments";
  }

  if (includesAny(text, ["document", "documents", "docs", "files"])) {
    return "project_documents";
  }

  if (
    includesAny(text, [
      "progress",
      "percentage",
      "percent",
      "completion",
      "complete rate",
    ])
  ) {
    return "project_progress";
  }

  if (includesAny(text, ["distribution", "breakdown", "chart", "by status"])) {
    return "status_distribution";
  }

  if (includesAny(text, ["how many", "count", "counts", "total", "summary"])) {
    return "task_counts";
  }

  if (includesAny(text, ["list", "show", "find", "search", "tasks", "task"])) {
    return "task_list";
  }

  return "project_overview";
};

const getAccessibleProject = async ({
  projectId,
  userEmail,
  userId,
}: {
  projectId: string;
  userEmail: string;
  userId: string;
}) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priority: true,
      startDate: true,
      endDate: true,
      organizationSlug: true,
      projectLeadEmail: true,
    },
  });

  if (!project) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found",
    });
  }

  const [organizationMember, projectMember] = await Promise.all([
    prisma.organizationMember.findUnique({
      where: {
        userId_organizationSlug: {
          userId,
          organizationSlug: project.organizationSlug,
        },
      },
      select: { role: true },
    }),
    prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      select: { role: true },
    }),
  ]);

  const isOrganizationAdmin =
    organizationMember?.role === OrganizationRole.OWNER ||
    organizationMember?.role === OrganizationRole.ADMIN;
  const isProjectMember = Boolean(projectMember);
  const isListedProjectLead =
    Boolean(project.projectLeadEmail) && project.projectLeadEmail === userEmail;
  const isProjectLead = projectMember?.role === ProjectMemberRole.LEAD;

  if (
    !isOrganizationAdmin &&
    !isProjectMember &&
    !isListedProjectLead &&
    !isProjectLead
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to use this project assistant",
    });
  }

  return project;
};

const getUserSession = async ({
  projectId,
  sessionId,
  userId,
}: {
  projectId: string;
  sessionId: string;
  userId: string;
}) => {
  const session = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      projectId,
      userId,
    },
  });

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Assistant chat session not found",
    });
  }

  return session;
};

const getCountsByStatus = async (projectId: string) => {
  const taskCounts = await prisma.task.groupBy({
    by: ["status"],
    _count: true,
    where: { projectId },
  });

  const countsByStatus = taskStatusOrder.reduce<Record<TaskStatus, number>>(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<TaskStatus, number>,
  );

  for (const count of taskCounts) {
    countsByStatus[count.status] = count._count;
  }

  return countsByStatus;
};

const getStatusSegments = (countsByStatus: Record<TaskStatus, number>) => {
  const total = taskStatusOrder.reduce(
    (sum, status) => sum + countsByStatus[status],
    0,
  );

  return taskStatusOrder.map((status) => ({
    status,
    label: taskStatusLabels[status],
    value: countsByStatus[status],
    percentage:
      total === 0 ? 0 : Math.round((countsByStatus[status] / total) * 100),
  }));
};

const getCompletionPercentage = (
  countsByStatus: Record<TaskStatus, number>,
) => {
  const total = taskStatusOrder.reduce(
    (sum, status) => sum + countsByStatus[status],
    0,
  );

  return total === 0
    ? 0
    : Math.round((countsByStatus[TaskStatus.DONE] / total) * 100);
};

const formatNullableDate = (date: Date | null) => date?.toISOString() ?? null;

const getDisplayName = (user: { email: string; name: string | null }) =>
  user.name ?? user.email;

const mapTaskRow = (task: {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignee: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  } | null;
  _count: {
    comments: number;
  };
}): ProjectAssistantTaskRow => ({
  id: task.id,
  name: task.name,
  description: task.description,
  status: task.status,
  statusLabel: taskStatusLabels[task.status],
  assignee: task.assignee
    ? {
        ...task.assignee,
        displayName: getDisplayName(task.assignee),
      }
    : null,
  dueDate: formatNullableDate(task.dueDate),
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
  commentCount: task._count.comments,
});

const extractQuotedPhrases = (message: string) =>
  Array.from(message.matchAll(/["']([^"']+)["']/g))
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));

const extractSearchTerm = (message: string) => {
  const quoted = extractQuotedPhrases(message)[0];

  if (quoted) {
    return quoted;
  }

  const match = message.match(/\b(?:search|find|called|named)\s+(.+)$/i);

  return match?.[1]?.trim();
};

const detectDueDateFilter = (
  message: string,
): Pick<TaskListFilters, "dueDateLabel" | "dueDateRange"> => {
  const text = normalizeText(message);
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const endToday = new Date(startToday);
  endToday.setDate(startToday.getDate() + 1);
  const nextWeek = new Date(startToday);
  nextWeek.setDate(startToday.getDate() + 7);

  if (includesAny(text, ["overdue", "past due", "late"])) {
    return {
      dueDateLabel: "overdue",
      dueDateRange: {
        lt: startToday,
      },
    };
  }

  if (includesAny(text, ["today", "due today"])) {
    return {
      dueDateLabel: "today",
      dueDateRange: {
        gte: startToday,
        lt: endToday,
      },
    };
  }

  if (includesAny(text, ["this week", "next 7 days", "due soon", "upcoming"])) {
    return {
      dueDateLabel: "next 7 days",
      dueDateRange: {
        gte: startToday,
        lt: nextWeek,
      },
    };
  }

  return {};
};

const detectAssigneeFilter = async ({
  message,
  projectId,
  userId,
}: {
  message: string;
  projectId: string;
  userId: string;
}): Promise<Pick<TaskListFilters, "assigneeId" | "assigneeLabel">> => {
  const text = normalizeText(message);

  if (
    includesAny(text, [
      "assigned to me",
      "my task",
      "my tasks",
      "for me",
      "mine",
    ])
  ) {
    return {
      assigneeId: userId,
      assigneeLabel: "me",
    };
  }

  const projectMembers = await prisma.projectMember.findMany({
    where: { projectId },
    select: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  const matchedMember = projectMembers.find(({ user }) => {
    const displayName = user.name ? normalizeText(user.name) : "";
    const email = normalizeText(user.email);
    const localPart = email.split("@")[0];

    return (
      (displayName && text.includes(displayName)) ||
      text.includes(email) ||
      text.includes(localPart)
    );
  });

  if (!matchedMember) {
    return {};
  }

  return {
    assigneeId: matchedMember.user.id,
    assigneeLabel: getDisplayName(matchedMember.user),
  };
};

const buildTaskFilters = async ({
  message,
  projectId,
  userId,
}: {
  message: string;
  projectId: string;
  userId: string;
}): Promise<TaskListFilters> => {
  const text = normalizeText(message);
  const status = detectTaskStatus(message);
  const search = extractSearchTerm(message);
  const dueDateFilter = detectDueDateFilter(message);
  const assigneeFilter = await detectAssigneeFilter({
    message,
    projectId,
    userId,
  });

  return {
    ...(status && { status }),
    ...(text.includes("pending") && !status && { statusNot: TaskStatus.DONE }),
    ...(search && { search }),
    ...dueDateFilter,
    ...assigneeFilter,
  };
};

const buildTaskWhere = ({
  filters,
  projectId,
}: {
  filters: TaskListFilters;
  projectId: string;
}): Prisma.TaskWhereInput => ({
  projectId,
  ...(filters.status && { status: filters.status }),
  ...(filters.statusNot && { status: { not: filters.statusNot } }),
  ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
  ...(filters.search && {
    OR: [
      {
        name: {
          contains: filters.search,
          mode: "insensitive" as const,
        },
      },
      {
        description: {
          contains: filters.search,
          mode: "insensitive" as const,
        },
      },
    ],
  }),
  ...(filters.dueDateRange && {
    dueDate: {
      ...(filters.dueDateRange.gte && { gte: filters.dueDateRange.gte }),
      ...(filters.dueDateRange.lte && { lte: filters.dueDateRange.lte }),
      ...(filters.dueDateRange.lt && { lt: filters.dueDateRange.lt }),
    },
  }),
});

const serializeTaskFilters = (filters: TaskListFilters) => ({
  ...(filters.status && { status: filters.status }),
  ...(filters.statusNot && { statusNot: filters.statusNot }),
  ...(filters.search && { search: filters.search }),
  ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
  ...(filters.assigneeLabel && { assignee: filters.assigneeLabel }),
  ...(filters.dueDateLabel && { dueDate: filters.dueDateLabel }),
});

const buildSummaryResponse = async (
  project: ProjectForAssistant,
  intent: AssistantIntent,
): Promise<ProjectAssistantResponse> => {
  const [countsByStatus, teamMembers, documentCount, commentCount] =
    await Promise.all([
      getCountsByStatus(project.id),
      prisma.projectMember.count({ where: { projectId: project.id } }),
      prisma.projectDocument.count({ where: { projectId: project.id } }),
      prisma.taskComment.count({
        where: {
          task: {
            projectId: project.id,
          },
        },
      }),
    ]);

  const totalTasks = taskStatusOrder.reduce(
    (sum, status) => sum + countsByStatus[status],
    0,
  );
  const completionPercentage = getCompletionPercentage(countsByStatus);
  const response: ProjectAssistantResponse = {
    type: AssistantResponseType.SUMMARY_CARDS,
    intent,
    answer: `${project.name} has ${totalTasks} tasks and is ${completionPercentage}% complete.`,
    payload: {
      title: `${project.name} overview`,
      cards: [
        {
          id: "total-tasks",
          label: "Total tasks",
          value: totalTasks,
          tone: "default",
        },
        {
          id: "completed",
          label: "Completed",
          value: countsByStatus[TaskStatus.DONE],
          description: `${completionPercentage}% complete`,
          tone: "success",
        },
        {
          id: "in-progress",
          label: "In progress",
          value: countsByStatus[TaskStatus.IN_PROGRESS],
          tone: "info",
        },
        {
          id: "in-review",
          label: "In review",
          value: countsByStatus[TaskStatus.IN_REVIEW],
          tone: "warning",
        },
        {
          id: "todo",
          label: "Todo",
          value: countsByStatus[TaskStatus.TODO],
          tone: "default",
        },
        {
          id: "backlog",
          label: "Backlog",
          value: countsByStatus[TaskStatus.BACKLOG],
          tone: "default",
        },
        {
          id: "team-members",
          label: "Team members",
          value: teamMembers,
          tone: "default",
        },
        {
          id: "documents",
          label: "Documents",
          value: documentCount,
          tone: "default",
        },
        {
          id: "comments",
          label: "Comments",
          value: commentCount,
          tone: "default",
        },
      ],
      statusSegments: getStatusSegments(countsByStatus),
    },
  };

  return projectAssistantResponseSchema.parse(response);
};

const buildProgressResponse = async (
  project: ProjectForAssistant,
  intent: AssistantIntent,
): Promise<ProjectAssistantResponse> => {
  const countsByStatus = await getCountsByStatus(project.id);
  const totalTasks = taskStatusOrder.reduce(
    (sum, status) => sum + countsByStatus[status],
    0,
  );
  const completedTasks = countsByStatus[TaskStatus.DONE];
  const completionPercentage = getCompletionPercentage(countsByStatus);
  const response: ProjectAssistantResponse = {
    type: AssistantResponseType.PROGRESS_CHART,
    intent,
    answer:
      totalTasks === 0
        ? `${project.name} does not have tasks yet.`
        : `${project.name} is ${completionPercentage}% complete with ${completedTasks} of ${totalTasks} tasks done.`,
    payload: {
      title: `${project.name} progress`,
      totalTasks,
      completedTasks,
      completionPercentage,
      statusSegments: getStatusSegments(countsByStatus),
    },
  };

  return projectAssistantResponseSchema.parse(response);
};

const buildTaskListResponse = async ({
  message,
  project,
  userId,
}: {
  message: string;
  project: ProjectForAssistant;
  userId: string;
}): Promise<ProjectAssistantResponse> => {
  const filters = await buildTaskFilters({
    message,
    projectId: project.id,
    userId,
  });
  const where = buildTaskWhere({
    filters,
    projectId: project.id,
  });
  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { position: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      take: TASK_LIST_LIMIT,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
  ]);

  const mappedTasks = tasks.map(mapTaskRow);
  const response: ProjectAssistantResponse = {
    type: AssistantResponseType.TASK_TABLE,
    intent: "task_list",
    answer:
      total === 0
        ? `I could not find matching tasks in ${project.name}.`
        : `I found ${total} matching task${total === 1 ? "" : "s"} in ${project.name}.`,
    payload: {
      title: "Matching tasks",
      ...(total > TASK_LIST_LIMIT && {
        description: `Showing the first ${TASK_LIST_LIMIT} tasks.`,
      }),
      tasks: mappedTasks,
      meta: {
        total,
        returned: mappedTasks.length,
        limit: TASK_LIST_LIMIT,
      },
      filters: serializeTaskFilters(filters),
    },
  };

  return projectAssistantResponseSchema.parse(response);
};

const buildRecentCommentsResponse = async (
  project: ProjectForAssistant,
): Promise<ProjectAssistantResponse> => {
  const comments = await prisma.taskComment.findMany({
    where: {
      task: {
        projectId: project.id,
      },
    },
    orderBy: { createdAt: "desc" },
    take: RECENT_COMMENT_LIMIT,
    include: {
      author: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
      task: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });

  const response: ProjectAssistantResponse = {
    type: AssistantResponseType.TEXT,
    intent: "recent_comments",
    answer:
      comments.length === 0
        ? `${project.name} does not have task comments yet.`
        : `Here are the ${comments.length} most recent task comments in ${project.name}.`,
    payload: {
      title: "Recent task comments",
      items: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        source: comment.source,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.id,
          email: comment.author.email,
          name: comment.author.name,
          image: comment.author.image,
          displayName: getDisplayName(comment.author),
        },
        task: {
          id: comment.task.id,
          name: comment.task.name,
          status: comment.task.status,
          statusLabel: taskStatusLabels[comment.task.status],
        },
      })),
    },
  };

  return projectAssistantResponseSchema.parse(response);
};

const buildDocumentsResponse = async (
  project: ProjectForAssistant,
): Promise<ProjectAssistantResponse> => {
  const [total, documents] = await Promise.all([
    prisma.projectDocument.count({
      where: { projectId: project.id },
    }),
    prisma.projectDocument.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      take: DOCUMENT_LIMIT,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    }),
  ]);

  const response: ProjectAssistantResponse = {
    type: AssistantResponseType.TEXT,
    intent: "project_documents",
    answer:
      total === 0
        ? `${project.name} does not have documents yet.`
        : `${project.name} has ${total} document${total === 1 ? "" : "s"}.`,
    payload: {
      title: "Project documents",
      items: documents.map((document) => ({
        id: document.id,
        name: document.name,
        createdAt: document.createdAt.toISOString(),
      })),
    },
  };

  return projectAssistantResponseSchema.parse(response);
};

const extractTaskTitle = (message: string) => {
  const quoted = extractQuotedPhrases(message)[0];

  if (quoted) {
    return quoted;
  }

  const match = message.match(
    /\b(?:create|add|make)\s+(?:a\s+|new\s+)?task(?:\s+(?:called|named|for|to))?\s+(.+)$/i,
  );
  const rawTitle = match?.[1]
    ?.replace(/\s+\b(?:due|assigned|with status|in status)\b.*$/i, "")
    .trim();

  return rawTitle && rawTitle.length > 1 ? rawTitle : null;
};

const findMentionedTask = async ({
  message,
  projectId,
}: {
  message: string;
  projectId: string;
}) => {
  const text = normalizeText(message);
  const quotedPhrases = extractQuotedPhrases(message).map(normalizeText);
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  return tasks
    .sort((a, b) => b.name.length - a.name.length)
    .find((task) => {
      const taskName = normalizeText(task.name);

      return (
        quotedPhrases.includes(taskName) ||
        new RegExp(`\\b${escapeRegExp(taskName)}\\b`).test(text) ||
        text.includes(taskName)
      );
    });
};

const extractCommentContent = (message: string) => {
  const quotedPhrases = extractQuotedPhrases(message);

  if (quotedPhrases.length >= 2) {
    return quotedPhrases[1];
  }

  const afterColon = message.split(":").slice(1).join(":").trim();

  if (afterColon) {
    return afterColon;
  }

  const match = message.match(/\bcomment\b(?:\s+(?:on|to)\b.*)?\s+(.+)$/i);

  return match?.[1]?.trim() ?? null;
};

const buildCreateTaskConfirmationResponse = (
  project: ProjectForAssistant,
  message: string,
): ProjectAssistantResponse => {
  const title = extractTaskTitle(message);
  const status = detectTaskStatus(message) ?? TaskStatus.TODO;
  const warnings = title
    ? []
    : ["A task title is required before confirmation."];
  const response: ProjectAssistantResponse = {
    type: AssistantResponseType.ACTION_CONFIRMATION,
    intent: "draft_create_task",
    answer:
      "I prepared a task creation draft. Confirm it in the UI before anything is saved.",
    payload: {
      action: "CREATE_TASK",
      title: "Create task",
      description: "This draft does not write to the database until confirmed.",
      requiresConfirmation: true,
      payload: {
        projectId: project.id,
        task: {
          name: title ?? "",
          description: null,
          status,
          dueDate: null,
          assigneeId: null,
        },
      },
      warnings,
    },
  };

  return projectAssistantResponseSchema.parse(response);
};

const buildCreateCommentConfirmationResponse = async (
  project: ProjectForAssistant,
  message: string,
): Promise<ProjectAssistantResponse> => {
  const targetTask = await findMentionedTask({
    message,
    projectId: project.id,
  });
  const content = extractCommentContent(message);
  const warnings = [
    ...(targetTask ? [] : ["A matching task is required before confirmation."]),
    ...(content ? [] : ["Comment content is required before confirmation."]),
  ];
  const response: ProjectAssistantResponse = {
    type: AssistantResponseType.ACTION_CONFIRMATION,
    intent: "draft_create_task_comment",
    answer:
      "I prepared a task comment draft. Confirm it in the UI before anything is saved.",
    payload: {
      action: "CREATE_TASK_COMMENT",
      title: "Add task comment",
      description: "This draft does not write to the database until confirmed.",
      requiresConfirmation: true,
      payload: {
        projectId: project.id,
        task: targetTask
          ? {
              id: targetTask.id,
              name: targetTask.name,
              status: targetTask.status,
            }
          : null,
        comment: {
          content: content ?? "",
        },
      },
      warnings,
    },
  };

  return projectAssistantResponseSchema.parse(response);
};

const buildAssistantResponse = async ({
  message,
  project,
  userId,
}: {
  message: string;
  project: ProjectForAssistant;
  userId: string;
}) => {
  const intent = detectIntent(message);

  switch (intent) {
    case "draft_create_task":
      return buildCreateTaskConfirmationResponse(project, message);
    case "draft_create_task_comment":
      return buildCreateCommentConfirmationResponse(project, message);
    case "task_list":
      return buildTaskListResponse({
        message,
        project,
        userId,
      });
    case "project_progress":
    case "status_distribution":
      return buildProgressResponse(project, intent);
    case "recent_comments":
      return buildRecentCommentsResponse(project);
    case "project_documents":
      return buildDocumentsResponse(project);
    case "task_counts":
    case "project_overview":
      return buildSummaryResponse(project, intent);
    default:
      return buildSummaryResponse(project, "project_overview");
  }
};

const toPrismaJson = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

const buildMessageMetadata = (response: ProjectAssistantResponse) =>
  ({
    intent: response.intent,
    payload: toPrismaJson(response.payload),
  }) satisfies Prisma.InputJsonObject;

export const projectAssistantRouter = router({
  createSession: protectedProcedure
    .input(
      projectAssistantInput.extend({
        title: z.string().trim().min(1).max(120).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getAccessibleProject({
        projectId: input.projectId,
        userEmail: ctx.auth.user.email,
        userId: ctx.auth.user.id,
      });

      return prisma.chatSession.create({
        data: {
          projectId: input.projectId,
          userId: ctx.auth.user.id,
          title: input.title ?? "Project assistant",
        },
      });
    }),
  getSessions: protectedProcedure
    .input(projectAssistantInput)
    .query(async ({ ctx, input }) => {
      await getAccessibleProject({
        projectId: input.projectId,
        userEmail: ctx.auth.user.email,
        userId: ctx.auth.user.id,
      });

      return prisma.chatSession.findMany({
        where: {
          projectId: input.projectId,
          userId: ctx.auth.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          _count: {
            select: {
              messages: true,
            },
          },
        },
      });
    }),
  getMessages: protectedProcedure
    .input(sessionInput)
    .query(async ({ ctx, input }) => {
      await getAccessibleProject({
        projectId: input.projectId,
        userEmail: ctx.auth.user.email,
        userId: ctx.auth.user.id,
      });
      await getUserSession({
        projectId: input.projectId,
        sessionId: input.sessionId,
        userId: ctx.auth.user.id,
      });

      return prisma.chatMessage.findMany({
        where: {
          sessionId: input.sessionId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }),
  sendMessage: protectedProcedure
    .input(
      projectAssistantInput.extend({
        message: z.string().trim().min(1).max(4000),
        sessionId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await getAccessibleProject({
        projectId: input.projectId,
        userEmail: ctx.auth.user.email,
        userId: ctx.auth.user.id,
      });
      const session = input.sessionId
        ? await getUserSession({
            projectId: input.projectId,
            sessionId: input.sessionId,
            userId: ctx.auth.user.id,
          })
        : await prisma.chatSession.create({
            data: {
              projectId: input.projectId,
              userId: ctx.auth.user.id,
              title: createSessionTitle(input.message),
            },
          });
      const response = await buildAssistantResponse({
        message: input.message,
        project,
        userId: ctx.auth.user.id,
      });

      const result = await prisma.$transaction(async (tx) => {
        const userMessage = await tx.chatMessage.create({
          data: {
            sessionId: session.id,
            role: ChatMessageRole.USER,
            content: input.message,
          },
        });
        const assistantMessage = await tx.chatMessage.create({
          data: {
            sessionId: session.id,
            role: ChatMessageRole.ASSISTANT,
            content: response.answer,
            responseType: response.type,
            metadata: buildMessageMetadata(response),
          },
        });
        const updatedSession = await tx.chatSession.update({
          where: { id: session.id },
          data: {
            ...(session.title
              ? {}
              : { title: createSessionTitle(input.message) }),
            updatedAt: new Date(),
          },
        });

        return {
          assistantMessage,
          session: updatedSession,
          userMessage,
        };
      });

      return {
        ...result,
        response,
      };
    }),
});
