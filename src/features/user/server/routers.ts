import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";

export const userInfo = router({
    getUserInfo: protectedProcedure.query(
        async ({ ctx }) => {
            const userId = ctx.auth.user.id;

            return await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true, image: true },
            })
        }
    )
});