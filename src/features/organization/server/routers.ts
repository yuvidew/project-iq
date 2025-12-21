import { PAGINATION } from "@/lib/config";
import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import type { Prisma } from "@/generated/prisma";

export const organizationRouter = router({
    createOrganization: protectedProcedure.input(
        z.object({
            name: z.string().min(2).max(100),
            description: z.string().max(500).optional(),
            slug: z.string().min(2).max(50),
            logoUrl: z.string().url().optional(),
        })
    ).mutation(async ({ input, ctx }) => {
        const { name, description, slug, logoUrl } = input;
        const userId = ctx.auth.user.id;


        // // slug must ne unique
        const existing = await prisma.organization.findUnique({
            where: { slug },
        });


        if (existing) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "Organization with this slug already exists",
            });
        };

        const organization = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const org = await tx.organization.create({
                data: {
                    name,
                    slug,
                    description,
                    logoUrl,
                    ownerId: userId,
                    members: {
                        create: {
                            userId,
                            role: "OWNER",
                        },
                    },
                },
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    lastActiveOrganizationId: org.id,
                },
            });

            return org;
        });

        return organization
    }),
    getOrganizations: protectedProcedure
        .input(
            z.object({
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z
                    .number()
                    .min(PAGINATION.MIN_PAGE_SIZE)
                    .max(PAGINATION.MAX_PAGE_SIZE)
                    .default(PAGINATION.DEFAULT_PAGE_SIZE),
                search: z.string().default(""),
            })
        )
        .query(async ({ input, ctx }) => {
            const userId = ctx.auth.user.id;
            const { page, pageSize, search } = input;

            const skip = (page - 1) * pageSize;


            const [items, total] = await prisma.$transaction([
                prisma.organization.findMany({
                    where: {
                        members: {
                            some: {
                                userId,
                            },
                        },
                        ...(search && {
                            OR: [
                                { name: { contains: search, mode: "insensitive" } },
                                { description: { contains: search, mode: "insensitive" } },
                            ],
                        }),
                    },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: pageSize,
                }),
                prisma.organization.count({
                    where: {
                        members: {
                            some: {
                                userId,
                            },
                        },
                        ...(search && {
                            OR: [
                                { name: { contains: search, mode: "insensitive" } },
                                { description: { contains: search, mode: "insensitive" } },
                            ],
                        }),
                    }
                }),
            ]);

            return {
                items,
                meta: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            };


        }),
    getOrganizationById: protectedProcedure.input(
        z.number()
    ).query(async ({ input: orgId, ctx }) => {
        const userId = ctx.auth.user.id;



        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId: orgId,
                },
            },
        });

        if (!membership) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not a member of this organization",
            });
        }

        return prisma.organization.findUnique({
            where: { id: orgId },
        });
    }),
    updateOrganization: protectedProcedure.input(
        z.object({
            organizationId: z.number(),
            name: z.string().min(2).max(100).optional(),
            description: z.string().max(500).optional(),
            logoUrl: z.string().url().optional(),
        })
    ).mutation(async ({ input, ctx }) => {
        const { organizationId, name, description, logoUrl } = input;
        const userId = ctx.auth.user.id;


        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });

        if (!membership || membership.role === "MEMBER") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not allowed to update this organization",
            });
        };

        return prisma.organization.update({
            where: { id: organizationId },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(logoUrl && { logoUrl }),
            },
        });

    }),

    removeOrganization: protectedProcedure.input(
        z.object({
            organizationId: z.number(),
        })
    ).mutation(async ({ input, ctx }) => {
        const { organizationId } = input;
        const userId = ctx.auth.user.id;

        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });

        if (!membership || membership.role !== "OWNER") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Only the owner can delete this organization",
            });
        }

        return await prisma.organization.delete({
            where: { id: organizationId },
        });

    }),
});
