import { Prisma, TaskStatus } from "@/generated/prisma";
import { PAGINATION } from "@/lib/config";
import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const taskRouter = router({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(2).max(100),
                description: z.string().optional(),
                status: z.nativeEnum(TaskStatus),
                projectId: z.string(),
                assigneeId: z.string(),
                dueDate: z.date().optional(),
                position : z.number()
            })
        )
        .mutation(async ({ input }) => {
            const { name, description, status, projectId, assigneeId, dueDate , position} =
                input;

            const project = await prisma.project.findUnique({
                where: { id: projectId },
            });

            if (!project) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

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
                    assignee: { connect: { id: assigneeId } },
                    dueDate,
                    position: finalPosition,
                },
            });
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
            })
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
                        { description: { contains: searchTerm, mode: "insensitive" as const } },
                    ],
                }),
                ...(assigneeIdTerm && { assigneeId: assigneeIdTerm }),
                ...(status && { status }),
            };

            const [total, tasks, projectMembers] = await Promise.all([
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

            const assignees = projectMembers
                .map((pm) => pm.user)
                .filter((u): u is NonNullable<typeof u> => Boolean(u));

            return {
                tasks,
                meta: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                }
            };
        }),

    getOne: protectedProcedure
        .input(z.string())
        .query(async ({ input: taskId }) => {
            const task = await prisma.task.findUnique({
                where: {
                    id: taskId,
                },
            });

            if (!task) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tasks not found",
                });
            };

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
                assigneeId: z.string(),
                dueDate: z.date().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const {
                id,
                name,
                description,
                status,
                projectId,
                assigneeId,
                dueDate
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

            const project = await prisma.project.findUnique({
                where: { id: projectId },
            });

            if (!project) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

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
                        assignee: { connect: { id: assigneeId } },
                        dueDate,
                        position:
                            status === existingTask.status
                                ? existingTask.position
                                : (lastTaskInStatus?.position ?? 0) + 1,
                    },
                });
            });

            return updatedTask;
        }),

    remove: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
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
            };

            return prisma.$transaction(async (tx) => {
                await tx.taskMember.deleteMany({
                    where: {
                        taskId: id
                    }
                });

                return tx.task.delete({ where: { id } })
            });
        }),

    getProjectPerformance: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
            })
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
                }
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
            };
        }),

    changePosition: protectedProcedure
        .input(
            z.object({
                updates: z.array(
                    z.object({
                        position: z.number(),
                        id: z.string(),
                        status: z.nativeEnum(TaskStatus),
                    })
                ).min(1, "No updates provided"),
            })
        )
        .mutation(async ({ input }) => {
            const { updates } = input;
            const TEMP_OFFSET = 1_000_000;

            const existingTasks = await prisma.task.findMany({
                where: { id: { in: updates.map((u) => u.id) } },
                select: { id: true },
            });

            if (existingTasks.length !== updates.length) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "One or more tasks were not found",
                });
            }

            const updatedTasks = await prisma.$transaction(async (tx) => {
                // First, move tasks to temporary positions to avoid unique constraint clashes.
                await Promise.all(
                    updates.map(({ id, position, status }) =>
                        tx.task.update({
                            where: { id },
                            data: {
                                status,
                                position: position + TEMP_OFFSET,
                            },
                        })
                    )
                );

                // Then, set the final positions.
                const finalized = await Promise.all(
                    updates.map(({ id, position }) =>
                        tx.task.update({
                            where: { id },
                            data: { position },
                            select: {
                                id: true,
                                name: true,
                                projectId: true,
                                status: true,
                                position: true,
                            },
                        })
                    )
                );

                return finalized;
            });

            const projectIds = Array.from(
                new Set(updatedTasks.map((task) => task.projectId))
            );

            return { updatedTasks, projectIds };
        })

});
