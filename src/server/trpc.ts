import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { TRPCContext } from "@/app/api/trpc/[trpc]/trpc-context";
import { cache } from 'react';
import { auth } from "@/lib/auth";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});

const t = initTRPC.context<TRPCContext>().create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
    // Prefer the request headers from the current tRPC call so cookies are preserved
    const session = await auth.api
        .getSession({
            headers: ctx.req.headers,
        })
        .catch((err) => {
            console.error("getSession failed", err);
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Failed to get session",
            });
        });

    if (!session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
        });
    }

    return next({
        ctx: { ...ctx, auth: session },
    });
});
