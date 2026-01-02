import { Prisma, ProjectPriority, ProjectStatus } from "@/generated/prisma";
import { PAGINATION } from "@/lib/config";
import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const projectRouter = router({
    create: protectedProcedure.input(
        z.object({
            name: z.string().min(2).max(100),
            description: z.string().max(500).optional(),
            status: z.nativeEnum(ProjectStatus),
            priority: z.nativeEnum(ProjectPriority),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            organizationSlug: z.string(),
            members: z.array(z.string().email()).min(1, "Select at least one member"),
            projectLeadEmail: z.string().email().optional(),
        })
    ).mutation(async ({ input }) => {
        const {
            name,
            description,
            status,
            startDate,
            endDate,
            organizationSlug,
            members,
            projectLeadEmail,
            priority,
        } = input;

        const organization = await prisma.organization.findUnique({
            where: { slug: organizationSlug },
        });

        if (!organization) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Organization not found",
            });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                startDate,
                endDate,
                status,
                priority,
                organization: { connect: { slug: organizationSlug } },
                projectLead: projectLeadEmail
                    ? { connect: { email: projectLeadEmail } }
                    : undefined,
                members: {
                    create: members.map((memberEmail) => ({
                        user: { connect: { email: memberEmail } },
                    })),
                },
            }
        });

        return project

    }),
    getMany: protectedProcedure.input(
        z.object({
            organizationSlug : z.string(),
            page: z.number().default(PAGINATION.DEFAULT_PAGE),
            pageSize: z
                .number()
                .min(PAGINATION.MIN_PAGE_SIZE)
                .max(PAGINATION.MAX_PAGE_SIZE)
                .default(PAGINATION.DEFAULT_PAGE_SIZE),
            search: z.string().default(""),
            status: z.nativeEnum(ProjectStatus).optional(),
            priority: z.nativeEnum(ProjectPriority).optional(),
        })
    ).query(async ({ input }) => {
        const { page, pageSize, search, status, priority, organizationSlug } = input;

        const skip = (page - 1) * pageSize;

        const searchTerm = search.trim();

        const where: Prisma.ProjectWhereInput = {
            organizationSlug,
            ...(searchTerm && {
                OR: [
                    { name: { contains: searchTerm, mode: "insensitive" as const } },
                    { description: { contains: searchTerm, mode: "insensitive" as const } },
                ],
            }),
            ...(status && { status }),
            ...(priority && { priority }),
        };

        const [total, projects] = await Promise.all([
            prisma.project.count({ where }),
            prisma.project.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
                include: {
                    organization: true,
                    projectLead: true,
                    members: {
                        select: {
                            user: {
                                select: { email: true },
                            },
                        },
                    },
                    _count: { select: { members: true } },
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
            projects: projectsWithMemberEmails,
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
        .query(async ({ input: projectId, ctx }) => {

            const project = await prisma.project.findUnique({
                where: {
                    id: projectId,
                },
            });

            if (!project) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Projects not found",
                });
            };

            return project;
        }),

    update: protectedProcedure.input(
        z.object({
            id: z.string(),
            name: z.string().min(2).max(100),
            description: z.string().max(500).optional(),
            status: z.nativeEnum(ProjectStatus),
            priority: z.nativeEnum(ProjectPriority),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            members: z.array(z.string().email()).min(1, "Select at least one member"),
            projectLeadEmail: z.string().email().nullable().optional(),
        })
    ).mutation(async ({ input, ctx }) => {
        const {
            id,
            name,
            description,
            status,
            startDate,
            endDate,
            members,
            projectLeadEmail,
            priority,
        } = input;

        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Projects not found",
            });
        };

        const updatedProject = await prisma.$transaction(async (tx) => {
            // reset members then recreate
            await tx.projectMember.deleteMany({ where: { projectId: id } });

            return tx.project.update({
                where: { id },
                data: {
                    name,
                    description,
                    status,
                    priority,
                    ...(startDate !== undefined && { startDate }),
                    ...(endDate !== undefined && { endDate }),
                    ...(projectLeadEmail !== undefined && {
                        projectLead: projectLeadEmail
                            ? { connect: { email: projectLeadEmail } }
                            : { disconnect: true },
                    }),
                    members: {
                        create: members.map((memberEmail) => ({
                            user: { connect: { email: memberEmail } },
                        })),
                    },
                },
            });
        });

        return updatedProject;

    }),
    remove: protectedProcedure.input(
        z.object({
            id: z.string(),
        })
    ).mutation(async ({ input, ctx }) => {
        const { id } = input;
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Project not found",
            });
        };

        return prisma.$transaction( async (tx) => {
            await tx.projectMember.deleteMany({
                where : {
                    projectId : id
                }
            });

            return tx.project.delete({where : {id}})
        });
    }),
});
