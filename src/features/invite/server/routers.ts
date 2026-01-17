
import { NotificationType } from "@/generated/prisma";
import prisma from "@/lib/db";
import { normalizeEmail } from "@/server/helpers/updateProjectStatus";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const inviteRouter = router({
    accept: protectedProcedure
        .input(
            z.object({
                token: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { token } = input;

            const invitation = await prisma.invitation.findUnique({
                where: { token },
                include: {
                    organization: true,
                },
            });

            if (!invitation) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Invitation not found",
                });
            };

            if (invitation.expiresAt < new Date()) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invitation has expired",
                });
            };

            if (normalizeEmail(invitation.email) !== normalizeEmail(ctx.auth.user.email)) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "This invitation was not sent to your email",
                });
            };

            // Prevent duplicate membership
            const existingMember = await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationSlug: {
                        userId: ctx.auth.user.id,
                        organizationSlug: invitation.organizationSlug,
                    },
                },
            });

            if (existingMember) {
                await prisma.invitation.delete({
                    where: { id: invitation.id },
                });

                return { alreadyMember: true };
            };

            // Create membership
            await prisma.organizationMember.create({
                data: {
                    userId: ctx.auth.user.id,
                    organizationSlug: invitation.organizationSlug,
                    role: invitation.role,
                },
            });

            //  update last active org
            await prisma.user.update({
                where: { id: ctx.auth.user.id },
                data: {
                    lastActiveOrganizationId: invitation.organization?.id,
                },
            });

            // Remove invitation
            await prisma.invitation.delete({
                where: { id: invitation.id },
            });

            return {
                success: true,
                organizationSlug: invitation.organizationSlug,
            };

        }),
    decline: protectedProcedure
        .input(
            z.object({
                token: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { token } = input;

            const invitation = await prisma.invitation.findUnique({
                where: { token },
            });

            if (!invitation) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Invitation not found",
                });
            };

            if (normalizeEmail(invitation.email) !== normalizeEmail(ctx.auth.user.email)) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not allowed to decline this invitation",
                });
            }

            const notifications = await prisma.notification.findMany({
                where: {
                    userId: ctx.auth.user.id,
                    type: NotificationType.INVITATION,
                },
                select: {
                    id: true,
                    data: true,
                },
            });

            const notificationIdsToRemove = notifications
                .filter((notification) => {
                    const data = notification.data as { token?: string };
                    return data.token === token;
                })
                .map((notification) => notification.id);

            if (notificationIdsToRemove.length > 0) {
                await prisma.notification.deleteMany({
                    where: {
                        id: {
                            in: notificationIdsToRemove,
                        },
                    },
                });
            }

            await prisma.invitation.delete({
                where: { id: invitation.id },
            });

            return { 
                declined: true,
                slug : invitation.organizationSlug
            };
        })
})
