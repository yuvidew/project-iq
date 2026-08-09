import { google } from "@ai-sdk/google";
import { TRPCError } from "@trpc/server";
import { generateObject, generateText } from "ai";
import z from "zod";
import { type Prisma, TaskStatus } from "@/generated/prisma";
import { PAGINATION } from "@/lib/config";
import prisma from "@/lib/db";
import { updateProjectStatus } from "@/server/helpers/updateProjectStatus";
import { protectedProcedure, router } from "@/server/trpc";

const unassignedValues = new Set(["", "unassigned", "no lead"]);

const taskStatusValues = Object.values(TaskStatus) as [
  TaskStatus,
  ...TaskStatus[],
];

const reviewedTaskSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  projectId: z.string(),
  assigneeId: z.string().nullable().optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  endDate: z.date().optional(),
  position: z.number().optional(),
});

const extractedTaskSchema = z.object({
  name: z.string().default("Untitled task"),
  description: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  assigneeText: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  warnings: z.array(z.string()).optional().default([]),
});

const normalizeAssigneeId = (assigneeId?: string | null) => {
  if (!assigneeId) return null;
  const normalized = assigneeId.trim().toLowerCase();
  return unassignedValues.has(normalized) ? null : assigneeId;
};

const normalizeTaskStatus = (status?: string | null): TaskStatus => {
  if (!status) return TaskStatus.TODO;

  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const statusMap: Record<string, TaskStatus> = {
    backlog: TaskStatus.BACKLOG,
    todo: TaskStatus.TODO,
    to_do: TaskStatus.TODO,
    pending: TaskStatus.TODO,
    open: TaskStatus.TODO,
    progress: TaskStatus.IN_PROGRESS,
    in_progress: TaskStatus.IN_PROGRESS,
    working: TaskStatus.IN_PROGRESS,
    review: TaskStatus.IN_REVIEW,
    in_review: TaskStatus.IN_REVIEW,
    done: TaskStatus.DONE,
    complete: TaskStatus.DONE,
    completed: TaskStatus.DONE,
  };

  const directMatch = taskStatusValues.find(
    (value) => value.toLowerCase() === normalized,
  );
  return directMatch ?? statusMap[normalized] ?? TaskStatus.TODO;
};

const parseOptionalDate = (value?: string | null) => {
  if (!value) return { date: undefined, warning: null };
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { date: undefined, warning: `Could not parse date: ${value}` };
  }

  return { date: parsed, warning: null };
};

const appendAssigneeText = (
  description: string | null | undefined,
  assigneeText: string,
) => {
  const note = `Assignee from image: ${assigneeText}`;
  return description ? `${description}\n\n${note}` : note;
};

const verifyProjectAccess = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      organizationSlug: true,
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
      select: { id: true },
    }),
    prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      select: { id: true },
    }),
  ]);

  if (!organizationMember && !projectMember) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have access to this project",
    });
  }

  return project;
};

const getValidAssigneeId = async (
  organizationSlug: string,
  assigneeId?: string | null,
) => {
  const normalizedAssigneeId = normalizeAssigneeId(assigneeId);
  if (!normalizedAssigneeId) return null;

  const member = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationSlug: {
        userId: normalizedAssigneeId,
        organizationSlug,
      },
    },
    select: { userId: true },
  });

  return member?.userId ?? null;
};

export const taskRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus),
        projectId: z.string(),
        assigneeId: z.string().nullable().optional(),
        startDate: z.date().optional(),
        dueDate: z.date().optional(),
        endDate: z.date().optional(),
        position: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        description,
        status,
        projectId,
        assigneeId,
        startDate,
        dueDate,
        endDate,
        position,
      } = input;

      const project = await verifyProjectAccess(projectId, ctx.auth.user.id);
      const validAssigneeId = await getValidAssigneeId(
        project.organizationSlug,
        assigneeId,
      );

      const lastTask = await prisma.task.findFirst({
        where: { projectId, status },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const defaultPosition = (lastTask?.position ?? 0) + 1000;
      const finalPosition = position > 0 ? position : defaultPosition;

      return await prisma.task.create({
        data: {
          name,
          description,
          status,
          project: { connect: { id: projectId } },
          assignee: validAssigneeId
            ? { connect: { id: validAssigneeId } }
            : undefined,
          startDate,
          dueDate,
          endDate,
          position: finalPosition,
        },
      });
    }),

  createMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        tasks: z.array(reviewedTaskSchema.omit({ projectId: true })).min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { projectId, tasks } = input;

      const project = await verifyProjectAccess(projectId, ctx.auth.user.id);
      const assigneeIds = Array.from(
        new Set(
          tasks
            .map((task) => normalizeAssigneeId(task.assigneeId))
            .filter((assigneeId): assigneeId is string => Boolean(assigneeId)),
        ),
      );

      const validAssignees = assigneeIds.length
        ? await prisma.organizationMember.findMany({
            where: {
              organizationSlug: project.organizationSlug,
              userId: { in: assigneeIds },
            },
            select: { userId: true },
          })
        : [];

      const validAssigneeIds = new Set(
        validAssignees.map((member) => member.userId),
      );
      const statuses = Array.from(
        new Set(tasks.map((task) => task.status ?? TaskStatus.TODO)),
      );
      const lastTasks = await prisma.task.findMany({
        where: {
          projectId,
          status: { in: statuses },
        },
        orderBy: { position: "desc" },
        distinct: ["status"],
        select: {
          status: true,
          position: true,
        },
      });

      const nextPositions = new Map<TaskStatus, number>(
        lastTasks.map((task) => [task.status, task.position]),
      );

      const createdTasks = await prisma.$transaction(
        tasks.map((task) => {
          const status = task.status ?? TaskStatus.TODO;
          const nextPosition = (nextPositions.get(status) ?? 0) + 1000;
          nextPositions.set(status, nextPosition);
          const validAssigneeId = normalizeAssigneeId(task.assigneeId);

          return prisma.task.create({
            data: {
              name: task.name,
              description: task.description,
              status,
              project: { connect: { id: projectId } },
              assignee:
                validAssigneeId && validAssigneeIds.has(validAssigneeId)
                  ? { connect: { id: validAssigneeId } }
                  : undefined,
              startDate: task.startDate,
              dueDate: task.dueDate,
              endDate: task.endDate,
              position:
                task.position && task.position > 0
                  ? task.position
                  : nextPosition,
            },
          });
        }),
      );

      await updateProjectStatus(projectId);

      return {
        createdCount: createdTasks.length,
        tasks: createdTasks,
        projectId,
      };
    }),

  extractTasksFromImage: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        imageUrl: z.string().url(),
        fileName: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { projectId, imageUrl, fileName } = input;
      const project = await verifyProjectAccess(projectId, ctx.auth.user.id);

      const members = await prisma.organizationMember.findMany({
        where: { organizationSlug: project.organizationSlug },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      const memberLines = members
        .map(
          ({ user }) => `${user.id}: ${user.name ?? "No name"} <${user.email}>`,
        )
        .join("\n");

      const model = google("gemini-2.5-flash");
      const prompt = `You are extracting tasks from an image for a project management app.

Return only tasks that are visible in the image. Each task can include title/name, assigned user, start date, end date, and optional status. Status is optional in the image; if it is missing or unclear, leave it empty. Valid app statuses are BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE.

Use ISO-8601 date strings when a date is visible or confidently inferred from the image. If a date is unclear, leave it empty and add a warning. If assignee text appears, copy it exactly in assigneeText.

Organization members for matching:
${memberLines || "No organization members available"}

Image file name: ${fileName ?? "unknown"}`;

      const { object } = await generateObject({
        model,
        schema: z.object({
          tasks: z.array(extractedTaskSchema).default([]),
        }),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image: new URL(imageUrl) },
            ],
          },
        ],
      });

      const normalizedMembers = members.map(({ user }) => ({
        id: user.id,
        email: user.email.toLowerCase(),
        name: user.name?.toLowerCase() ?? "",
      }));

      const tasks = object.tasks.map((task) => {
        const warnings = [...(task.warnings ?? [])];
        const status = normalizeTaskStatus(task.status);
        const parsedStartDate = parseOptionalDate(task.startDate);
        const parsedEndDate = parseOptionalDate(task.endDate);
        const assigneeText = task.assigneeText?.trim() ?? "";

        if (parsedStartDate.warning) warnings.push(parsedStartDate.warning);
        if (parsedEndDate.warning) warnings.push(parsedEndDate.warning);
        if (!task.status)
          warnings.push("Status was not found, defaulted to TODO");

        const normalizedAssigneeText = assigneeText.toLowerCase();
        const matchedMember = normalizedAssigneeText
          ? normalizedMembers.find(
              (member) =>
                member.email === normalizedAssigneeText ||
                member.name === normalizedAssigneeText ||
                member.email.includes(normalizedAssigneeText) ||
                member.name?.includes(normalizedAssigneeText),
            )
          : null;

        const description =
          assigneeText && !matchedMember
            ? appendAssigneeText(task.description, assigneeText)
            : (task.description ?? undefined);

        if (assigneeText && !matchedMember) {
          warnings.push("Assignee was not matched to an organization member");
        }

        return {
          name: task.name || "Untitled task",
          description,
          status,
          startDate: parsedStartDate.date,
          endDate: parsedEndDate.date,
          assigneeText: assigneeText || undefined,
          assigneeId: matchedMember?.id ?? null,
          confidence: task.confidence ?? 0.7,
          warnings,
        };
      });

      return { tasks, projectId };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
        status: z.nativeEnum(TaskStatus).optional(),
        assigneeId: z.string().default(""),
      }),
    )
    .query(async ({ input }) => {
      const { page, pageSize, search, status, assigneeId, projectId } = input;

      const skip = (page - 1) * pageSize;

      const searchTerm = search.trim();
      const assigneeIdTerm = assigneeId.trim();

      const where: Prisma.TaskWhereInput = {
        projectId,
        ...(searchTerm && {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" as const } },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
        ...(assigneeIdTerm && { assigneeId: assigneeIdTerm }),
        ...(status && { status }),
      };

      const [total, tasks] = await Promise.all([
        prisma.task.count({ where }),
        prisma.task.findMany({
          where,
          orderBy: [
            { status: "asc" },
            { position: "asc" },
            { createdAt: "desc" },
          ],
          skip,
          take: pageSize,
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            },
            project: {
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
            },
          },
        }),
        prisma.projectMember.findMany({
          where: { projectId },
          select: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
        }),
      ]);

      return {
        tasks,
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  getMyTasks: protectedProcedure
    .input(
      z.object({
        organizationSlug: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const { organizationSlug: slug } = input;

      // Find organization is present of not
      const existing = await prisma.organization.findUnique({
        where: { slug },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      return await prisma.task.findMany({
        where: {
          assigneeId: userId,
          project: {
            organizationSlug: slug,
          },
        },
      });
    }),

  getOne: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        taskId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { projectId, taskId } = input;

      const [task] = await Promise.all([
        prisma.task.findUnique({
          where: {
            id: taskId,
          },
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            },
            project: {
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
            },
          },
        }),
      ]);

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tasks not found",
        });
      }

      await updateProjectStatus(projectId);

      return task;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).max(100),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus),
        projectId: z.string(),
        assigneeId: z.string().nullable().optional(),
        startDate: z.date().optional(),
        dueDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        name,
        description,
        status,
        projectId,
        assigneeId,
        startDate,
        dueDate,
        endDate,
      } = input;

      const existingTask = await prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tasks not found",
        });
      }

      const project = await verifyProjectAccess(projectId, ctx.auth.user.id);
      const validAssigneeId = await getValidAssigneeId(
        project.organizationSlug,
        assigneeId,
      );

      const updatedTask = await prisma.$transaction(async (tx) => {
        const lastTaskInStatus =
          status === existingTask.status
            ? null
            : await tx.task.findFirst({
                where: { projectId, status },
                orderBy: { position: "desc" },
                select: { position: true },
              });

        return tx.task.update({
          where: { id },
          data: {
            name,
            description,
            status,
            project: { connect: { id: projectId } },
            assignee: validAssigneeId
              ? { connect: { id: validAssigneeId } }
              : { disconnect: true },
            startDate,
            dueDate,
            endDate,
            position:
              status === existingTask.status
                ? existingTask.position
                : (lastTaskInStatus?.position ?? 0) + 1,
          },
        });
      });

      await updateProjectStatus(projectId);

      return updatedTask;
    }),

  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      return prisma.$transaction(async (tx) => {
        await tx.taskMember.deleteMany({
          where: {
            taskId: id,
          },
        });

        await updateProjectStatus(task.projectId);

        return tx.task.delete({ where: { id } });
      });
    }),

  getProjectPerformance: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { projectId } = input;

      const [project, taskCounts, teamMembers] = await Promise.all([
        prisma.project.findUnique({ where: { id: projectId } }),
        prisma.task.groupBy({
          by: ["status"],
          _count: true,
          where: { projectId },
        }),
        prisma.projectMember.count({ where: { projectId } }),
      ]);

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const countsByStatus = taskCounts.reduce<Record<TaskStatus, number>>(
        (acc, curr) => {
          acc[curr.status as TaskStatus] = curr._count;
          return acc;
        },
        {
          [TaskStatus.BACKLOG]: 0,
          [TaskStatus.IN_REVIEW]: 0,
          [TaskStatus.TODO]: 0,
          [TaskStatus.IN_PROGRESS]: 0,
          [TaskStatus.DONE]: 0,
        },
      );

      const total =
        countsByStatus[TaskStatus.BACKLOG] +
        countsByStatus[TaskStatus.IN_REVIEW] +
        countsByStatus[TaskStatus.TODO] +
        countsByStatus[TaskStatus.IN_PROGRESS] +
        countsByStatus[TaskStatus.DONE];

      return {
        totalTasks: total,
        completed: countsByStatus[TaskStatus.DONE],
        inProgress: countsByStatus[TaskStatus.IN_PROGRESS],
        backlog: countsByStatus[TaskStatus.BACKLOG],
        inReview: countsByStatus[TaskStatus.IN_REVIEW],
        todo: countsByStatus[TaskStatus.TODO],
        teamMembers,
        project,
      };
    }),

  changePosition: protectedProcedure
    .input(
      z.object({
        updates: z
          .array(
            z.object({
              position: z.number(),
              id: z.string(),
              status: z.nativeEnum(TaskStatus),
            }),
          )
          .min(1, "No updates provided"),
      }),
    )
    .mutation(async ({ input }) => {
      const { updates } = input;

      const existingTasks = await prisma.task.findMany({
        where: { id: { in: updates.map((u) => u.id) } },
        select: { id: true, projectId: true },
      });

      if (existingTasks.length !== updates.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more tasks were not found",
        });
      }

      // Use raw SQL to update all tasks in a single query
      // This avoids the unique constraint issue by updating all at once
      const updatedTasks = await prisma.$transaction(
        async (tx) => {
          // Update each task's status and position using raw SQL with CASE
          // First, set all positions to NULL temporarily (if allowed) or use negative unique values

          // Step 1: Move all affected tasks to unique temporary positions using their array index
          for (let i = 0; i < updates.length; i++) {
            const { id, status } = updates[i];
            // Use a unique negative position based on timestamp + index to avoid any collision
            const tempPosition = -2_000_000_000 + i;
            await tx.$executeRaw`
                            UPDATE "Task" 
                            SET "status" = ${status}::"TaskStatus", "position" = ${tempPosition}
                            WHERE "id" = ${id}
                        `;
          }

          // Step 2: Set final positions
          for (const { id, position } of updates) {
            await tx.$executeRaw`
                            UPDATE "Task" 
                            SET "position" = ${position}
                            WHERE "id" = ${id}
                        `;
          }

          // Fetch and return the updated tasks
          const finalized = await tx.task.findMany({
            where: { id: { in: updates.map((u) => u.id) } },
            select: {
              id: true,
              name: true,
              projectId: true,
              status: true,
              position: true,
            },
          });

          return finalized;
        },
        {
          maxWait: 10000,
          timeout: 30000,
        },
      );

      const projectIds = Array.from(
        new Set(updatedTasks.map((task) => task.projectId)),
      );

      await Promise.all(projectIds.map(updateProjectStatus));

      return { updatedTasks, projectIds };
    }),
  removeAll: protectedProcedure
    .input(
      z.object({
        taskIds: z.array(z.string()).min(1, "No task ids provided"),
      }),
    )
    .mutation(async ({ input }) => {
      const { taskIds } = input;

      const existingTasks = await prisma.task.findMany({
        where: { id: { in: taskIds } },
        select: { id: true },
      });

      if (existingTasks.length !== taskIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more tasks were not found",
        });
      }

      const deleted = await prisma.$transaction(async (tx) => {
        await tx.taskMember.deleteMany({
          where: { taskId: { in: taskIds } },
        });

        return tx.task.deleteMany({
          where: { id: { in: taskIds } },
        });
      });

      return { deletedCount: deleted.count };
    }),
  createDocument: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
        document: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { projectId, name, document } = input;

      const projectExisting = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!projectExisting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return await prisma.projectDocument.create({
        data: {
          name,
          document,
          project: { connect: { id: projectId } },
        },
      });
    }),
  getDocuments: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const { projectId } = input;

      const where: Prisma.ProjectDocumentWhereInput = {
        projectId,
      };

      const projectExisting = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          organizationSlug: true,
        },
      });

      if (!projectExisting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Check user's role in organization and project
      const [documents, organizationMember, _projectMember] = await Promise.all(
        [
          prisma.projectDocument.findMany({
            where,
            orderBy: { createdAt: "desc" },
          }),
          prisma.organizationMember.findUnique({
            where: {
              userId_organizationSlug: {
                userId,
                organizationSlug: projectExisting.organizationSlug,
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
        ],
      );

      // User can edit if they are OWNER or ADMIN in organization, or LEAD in project
      const canEdit =
        organizationMember?.role === "OWNER" ||
        organizationMember?.role === "ADMIN";

      // Add isEdit flag to each document
      const documentsWithEditFlag = documents.map((doc) => ({
        ...doc,
        isEdit: canEdit,
      }));

      return {
        documents: documentsWithEditFlag,
        canEdit,
      };
    }),

  updateDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        document: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const { id, name, document } = input;

      const existingDoc = await prisma.projectDocument.findUnique({
        where: { id },
        include: {
          project: {
            select: { organizationSlug: true },
          },
        },
      });

      if (!existingDoc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Check user's role in organization and project
      const [organizationMember, projectMember] = await Promise.all([
        prisma.organizationMember.findUnique({
          where: {
            userId_organizationSlug: {
              userId,
              organizationSlug: existingDoc.project.organizationSlug,
            },
          },
          select: { role: true },
        }),
        prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId: existingDoc.projectId,
              userId,
            },
          },
          select: { role: true },
        }),
      ]);

      // Only OWNER, ADMIN, or project LEAD can edit
      const canEdit =
        organizationMember?.role === "OWNER" ||
        organizationMember?.role === "ADMIN" ||
        projectMember?.role === "LEAD";

      if (!canEdit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this document",
        });
      }

      return await prisma.projectDocument.update({
        where: { id },
        data: {
          name,
          document,
        },
      });
    }),

  removeDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const { id } = input;

      const existingDoc = await prisma.projectDocument.findUnique({
        where: { id },
        include: {
          project: {
            select: { organizationSlug: true },
          },
        },
      });

      if (!existingDoc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Check user's role in organization and project
      const [organizationMember, projectMember] = await Promise.all([
        prisma.organizationMember.findUnique({
          where: {
            userId_organizationSlug: {
              userId,
              organizationSlug: existingDoc.project.organizationSlug,
            },
          },
          select: { role: true },
        }),
        prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId: existingDoc.projectId,
              userId,
            },
          },
          select: { role: true },
        }),
      ]);

      // Only OWNER, ADMIN, or project LEAD can delete
      const canEdit =
        organizationMember?.role === "OWNER" ||
        organizationMember?.role === "ADMIN" ||
        projectMember?.role === "LEAD";

      if (!canEdit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this document",
        });
      }

      return await prisma.projectDocument.delete({
        where: { id },
      });
    }),

  chatWithDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        question: z.string().min(5),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, question } = input;
      const existingDoc = await prisma.projectDocument.findUnique({
        where: { id },
        include: {
          project: {
            select: { organizationSlug: true },
          },
        },
      });

      if (!existingDoc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Extract plain text from the document JSON (TipTap/ProseMirror format)
      const extractTextFromDocument = (docJson: string): string => {
        try {
          const doc = JSON.parse(docJson);

          interface DocumentNode {
            type?: string;
            text?: string;
            content?: DocumentNode[];
          }

          const extractText = (node: DocumentNode): string => {
            if (node.type === "text" && node.text) {
              return node.text;
            }
            if (node.content && Array.isArray(node.content)) {
              const childText = node.content.map(extractText).join("");
              if (
                [
                  "paragraph",
                  "heading",
                  "listItem",
                  "bulletList",
                  "orderedList",
                  "numberedListItem",
                ].includes(node.type || "")
              ) {
                return `${childText}\n`;
              }
              return childText;
            }
            return "";
          };

          if (Array.isArray(doc)) {
            return doc.map(extractText).join("\n").trim();
          } else {
            return extractText(doc as DocumentNode).trim();
          }
        } catch {
          return docJson;
        }
      };

      const documentText = extractTextFromDocument(existingDoc.document);

      // Build prompt with document context
      const prompt = `You are a helpful assistant for a project management application. Use the following document content as context to answer the user's question. If the answer cannot be found in the document, say so politely.

            Document Title: ${existingDoc.name}

            Document Content:
            ${documentText}

            User Question: ${question}

            Please provide a clear, concise, and helpful answer based on the document content:`;

      const model = google("gemini-2.5-flash");

      const { text } = await generateText({
        model,
        prompt,
      });

      return { answer: text };
    }),
});
