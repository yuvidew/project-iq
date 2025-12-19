import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { createSessionClient } from "./appwriter";
import { TRPCContext } from "@/app/api/trpc/[trpc]/trpc-context";

const t = initTRPC.context<TRPCContext>().create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    try {
        const sessionClient = await createSessionClient();
        
        if (!sessionClient) {
            throw new Error("Unauthorized");
        }
        
        const { account, databases, storage } = sessionClient;
        const user = await account.get();
        
        return next({
            ctx: {
                ...ctx,
                user,
                account,
                db: databases,
                storage,
            },
        });
    } catch (err) {
        throw new Error("Unauthorized");
    }
});