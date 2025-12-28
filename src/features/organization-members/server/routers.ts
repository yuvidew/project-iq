import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const organizationMembersRouter = router({
    getMany: protectedProcedure
        .input(z.string())
        .query(async ({ input }: { input: string }) => {
            const organizationSlug = input;
            const organization = await prisma.organization.findUnique({
                where: { slug: organizationSlug },
            });

            if (!organization) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
            }

            const members = await prisma.organizationMember.findMany({
                where : {organizationSlug},
                select : {
                    role : true,
                    user : {
                        select : {
                            id : true,
                            name : true,
                            email : true,
                            image : true,
                        },
                    },
                },
                orderBy : { createdAt : "desc"},
            });


            return members.map((member) => ({
                ...member.user,
                role : member.role
            }))
        }),
})
