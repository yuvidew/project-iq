import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const settingRouter = router({
    getOrgBySlug: protectedProcedure
        .input(
            z.object({
                slug: z.string().min(2).max(50),
            })
        )
        .query(async ({ input: { slug }, ctx }) => {
            const userId = ctx.auth.user.id;

            const organization = await prisma.organization.findUnique({
                where: { slug },
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
                    organizationSlug: organization.slug,
                },
            });

            if (!membership) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not a member of this organization",
                });
            }

            return organization;
        }),
    
    getOrgAccessMembers: protectedProcedure
        .input(
            z.object({
                slug: z.string().min(2).max(50),
            })
        )
        .query(async ({ input: { slug }, ctx }) => {
            const userId = ctx.auth.user.id;
            const organization = await prisma.organization.findUnique({
                where: { slug },
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
                    organizationSlug: organization.slug,
                },
            });
            if (!membership) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not a member of this organization",
                });
            }
            const members = await prisma.organizationMember.findMany({
                where: {
                    organizationSlug: organization.slug,
                },
                select: {
                    id: true,
                    role: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            });
            return members;
        }),

    

    deleteOrganization: protectedProcedure
        .input(
            z.object({
                slug: z.string().min(2).max(50),
            })
        )
        .mutation(async ({ input: { slug }, ctx }) => {
            const userId = ctx.auth.user.id;
            const organization = await prisma.organization.findUnique({
                where: { slug },
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
                    organizationSlug: organization.slug,
                },
            });
            if (!membership || membership.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not have permission to delete this organization",
                });
            }
            return await prisma.organization.delete({
                where: { slug: organization.slug },
            });
        }),
});