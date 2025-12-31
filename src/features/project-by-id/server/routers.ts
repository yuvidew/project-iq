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
            })
        )
        .mutation(async ({ input }) => {
            const { name, description, status, projectId, assigneeId, dueDate } =
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

            return await prisma.task.create({
                data: {
                    name,
                    description,
                    status,
                    project: { connect: { id: projectId } },
                    assignee: { connect: { id: assigneeId } },
                    dueDate,
                    position: (lastTask?.position ?? 0) + 1,
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

            const [total, tasks] = await Promise.all([
                prisma.task.count({ where }),
                prisma.task.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: pageSize,
                })
            ]);

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
        })

});
