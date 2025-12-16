import { protectedProcedure, router } from "@/server/trpc";
import z from "zod";

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
        const { userId, db } = ctx;
        })
});