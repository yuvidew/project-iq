import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const userInfo = router({
    getUserInfo: protectedProcedure.query(
        async ({ ctx }) => {
            const userId = ctx.auth.user.id;

            return await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true, image: true },
            });
        },
    ),

    switchUserActiveOrg: protectedProcedure.input(
        z.object({
            orgId: z.number()
        })
    ).mutation(
        async ({ input, ctx }) => {
            const { orgId } = input;

            const userId = ctx.auth.user.id;

            const org = await prisma.organization.findUnique({
                where: { id: orgId },
                select: { id: true, slug: true },
            });


            if (!org) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Organization not found",
                });
            };

            const membership = await prisma.organizationMember.findUnique({
                where: { userId_organizationId: { userId, organizationId: orgId } },
            });
            if (!membership) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this organization" });
            };

            const user =  await prisma.user.update({
                where: { id: userId },
                data: {
                    lastActiveOrganizationId: orgId,
                },
                select: { id: true, lastActiveOrganizationId: true},
            });

            return { user, organization: org };
        }
    )
});