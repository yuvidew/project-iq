import { Prisma, TaskStatus } from "@/generated/prisma";
import { PAGINATION } from "@/lib/config";
import prisma from "@/lib/db";
import { updateProjectStatus } from "@/server/helpers/updateProjectStatus";
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
                position: z.number()
            })
        )
        .mutation(async ({ input }) => {
            const { name, description, status, projectId, assigneeId, dueDate, position } =
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
                }
            };
        }),

    getMyTasks: protectedProcedure
        .input(
            z.object({
                organizationSlug: z.string(),
            })
        ).query(async ({ input, ctx }) => {
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
                where : {
                    assigneeId : userId,
                    project : {
                        organizationSlug : slug
                    },
                },
            });

        }),

    getOne: protectedProcedure
        .input(z.object({
            projectId: z.string(),
            taskId: z.string(),
        }))
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

            ])


            if (!task) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tasks not found",
                });
            };

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

            await updateProjectStatus(projectId);

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

                await updateProjectStatus(task.projectId);

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
                project
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
                }
            );

            const projectIds = Array.from(
                new Set(updatedTasks.map((task) => task.projectId))
            );

            await Promise.all(projectIds.map(updateProjectStatus));

            return { updatedTasks, projectIds };
        }),
    removeAll: protectedProcedure
        .input(
            z.object({
                taskIds: z.array(z.string()).min(1, "No task ids provided"),
            })
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
    createDocument : protectedProcedure
        .input(
            z.object({
                projectId : z.string(),
                name : z.string(),
                document : z.string(),
            })
        )
        .mutation ( async ({ input }) => {
            const { projectId, name, document } = input;

            const projectExisting = await prisma.project.findUnique({
                where : { id : projectId  }
            });

            if (!projectExisting) {
                throw new TRPCError({
                    code : "NOT_FOUND",
                    message : "Project not found"
                });
            }

            return await prisma.projectDocument.create(
                {
                    data : {
                        name,
                        document,
                        project : { connect : { id : projectId }}
                    }
                }
            )
        }),
    getDocuments : protectedProcedure
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
            })
        )
        .query ( async ({ input, ctx }) => {
            const userId = ctx.auth.user.id;
            const { projectId, page, pageSize, search } = input;

            const skip = (page - 1) * pageSize;

            const searchTerm = search.trim();

            const where: Prisma.ProjectDocumentWhereInput = {
                projectId,
                ...(searchTerm && {
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" as const } },
                    ],
                }),
            };

            const projectExisting = await prisma.project.findUnique({
                where : { id : projectId  },
                select: {
                    id: true,
                    organizationSlug: true,
                }
            });

            if (!projectExisting) {
                throw new TRPCError({
                    code : "NOT_FOUND",
                    message : "Project not found"
                });
            };

            // Check user's role in organization and project
            const [total, documents, organizationMember, projectMember] = await Promise.all([
                prisma.projectDocument.count({ where }),
                prisma.projectDocument.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: pageSize,
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
            ]);

            // User can edit if they are OWNER or ADMIN in organization, or LEAD in project
            const canEdit = 
                organizationMember?.role === "OWNER" || 
                organizationMember?.role === "ADMIN" ;

            // Add isEdit flag to each document
            const documentsWithEditFlag = documents.map((doc) => ({
                ...doc,
                isEdit: canEdit,
            }));
            
            return {
                documents: documentsWithEditFlag,
                canEdit,
                meta: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                }
            };
        }
        ),

    updateDocument : protectedProcedure
        .input(
            z.object({
                id : z.string(),
                name : z.string(),
                document : z.string(),
            })
        )
        .mutation ( async ({ input, ctx }) => {
            const userId = ctx.auth.user.id;
            const { id, name, document } = input;

            const existingDoc = await prisma.projectDocument.findUnique({
                where : { id },
                include: {
                    project: {
                        select: { organizationSlug: true }
                    }
                }
            });

            if (!existingDoc) {
                throw new TRPCError({
                    code : "NOT_FOUND",
                    message : "Document not found"
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
                    message: "You don't have permission to edit this document"
                });
            }

            return await prisma.projectDocument.update(
                {
                    where : { id },
                    data : {
                        name,
                        document,
                    }
                }
            );
        }),

        removeDocument : protectedProcedure
        .input(
            z.object({
                id : z.string(),
            })
        )
        .mutation ( async ({ input, ctx }) => {
            const userId = ctx.auth.user.id;
            const { id } = input;

            const existingDoc = await prisma.projectDocument.findUnique({
                where : { id },
                include: {
                    project: {
                        select: { organizationSlug: true }
                    }
                }
            });

            if (!existingDoc) {
                throw new TRPCError({
                    code : "NOT_FOUND",
                    message : "Document not found"
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
                    message: "You don't have permission to delete this document"
                });
            }

            return await prisma.projectDocument.delete(
                {
                    where : { id }
                }
            );
        }),
});
