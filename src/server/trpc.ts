import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { createSessionClient } from "./appwriter";

const t = initTRPC.create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    try {
        const { account, databases} = await createSessionClient();

        const user = await account.get();
        return next({ 
            ctx: { 
                ...ctx, 
                user,
                account: account,
                db: databases,
            },
        });
    } catch (err) {
        throw new Error("Unauthorized");
    }
});
