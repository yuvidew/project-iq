import { Prisma, ProjectStatus, TaskStatus } from "@/generated/prisma";
import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const organizationBySlugRouter = router({
    getOrganizationBySlug: protectedProcedure
        .input(
            z.object({
                slug: z.string(),
                search: z.string().default(""),
            })
        )
        .query(async ({ input, ctx }) => {
            const { slug, search } = input;
            const userId = ctx.auth.user.id;

            const searchTerm = search.trim();

            const projectSearchFilter: Prisma.ProjectWhereInput = searchTerm
                ? {
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" as const } },
                        { description: { contains: searchTerm, mode: "insensitive" as const } },
                    ],
                }
                : {};

            const taskSearchFilter: Prisma.TaskWhereInput = searchTerm
                ? {
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" as const } },
                        { description: { contains: searchTerm, mode: "insensitive" as const } },
                    ],
                }
                : {};

            const organization = await prisma.organization.findUnique({
                where: { slug },
                select: { id: true, name: true, slug: true },
            });

            if (!organization) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Organization not found",
                });
            }

            const membership = await prisma.organizationMember.findFirst({
                where: {
                    userId,
                    organizationSlug: slug,
                },
                select: { id: true },
            });

            if (!membership) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not a member of this organization",
                });
            }

            const now = new Date();

            const [
                totalProjects,
                completedProjects,
                myTasksCount,
                overdueTasksCount,
                projects,
                recentActivity,
                myTasksList,
                overdueTasksList,
                inProgressTasksList,
            ] = await Promise.all([
                prisma.project.count({
                    where: {
                        organizationSlug: slug,
                        ...projectSearchFilter,
                    },
                }),
                prisma.project.count({
                    where: {
                        organizationSlug: slug,
                        status: ProjectStatus.COMPLETED,
                        ...projectSearchFilter,
                    },
                }),
                prisma.task.count({
                    where: {
                        assigneeId: userId,
                        project: { organizationSlug: slug },
                        ...taskSearchFilter,
                    },
                }),
                prisma.task.count({
                    where: {
                        project: { organizationSlug: slug },
                        dueDate: { lt: now },
                        status: { not: TaskStatus.DONE },
                        ...taskSearchFilter,
                    },
                }),
                prisma.project.findMany({
                    where: {
                        organizationSlug: slug,
                        ...projectSearchFilter,
                    },
                    orderBy: { updatedAt: "desc" },
                    take: 5,
                    include: {
                        members: {
                            select: {
                                user: { select: { email: true, id: true, name: true } },
                            },
                        },
                        _count: { select: { members: true } },
                    },
                }),
                prisma.task.findMany({
                    where: {
                        project: { organizationSlug: slug },
                        ...taskSearchFilter,
                    },
                    orderBy: { updatedAt: "desc" },
                    take: 5,
                    include: {
                        project: { select: { id: true, name: true } },
                        assignee: {
                            select: { id: true, email: true, name: true },
                        },
                    },
                }),
                prisma.task.findMany({
                    where: {
                        assigneeId: userId,
                        project: { organizationSlug: slug },
                        ...taskSearchFilter,
                    },
                    orderBy: { updatedAt: "desc" },
                    take: 5,
                    include: {
                        project: { select: { id: true, name: true } },
                    },
                }),
                prisma.task.findMany({
                    where: {
                        project: { organizationSlug: slug },
                        dueDate: { lt: now },
                        status: { not: TaskStatus.DONE },
                        ...taskSearchFilter,
                    },
                    orderBy: { dueDate: "asc" },
                    take: 5,
                    include: {
                        project: { select: { id: true, name: true } },
                        assignee: {
                            select: { id: true, email: true, name: true },
                        },
                    },
                }),
                prisma.task.findMany({
                    where: {
                        project: { organizationSlug: slug },
                        status: TaskStatus.IN_PROGRESS,
                        ...taskSearchFilter,
                    },
                    orderBy: { updatedAt: "desc" },
                    take: 5,
                    include: {
                        project: { select: { id: true, name: true } },
                        assignee: {
                            select: { id: true, email: true, name: true },
                        },
                    },
                }),
            ]);

            const projectsWithMemberEmails = projects.map((project) => ({
                ...project,
                members: project.members
                    .map(({ user }) => user?.email)
                    .filter((email): email is string => Boolean(email))
                    .map((email) => ({ email })),
            }));

            return {
                organization,
                totalProjects,
                completedProjects,
                myTasks: myTasksCount,
                overdueTasks: overdueTasksCount,
                projects: projectsWithMemberEmails,
                recentActivity,
                myTasksList,
                overdueTasksList,
                inProgressTasks: inProgressTasksList,
            };
        })
})
