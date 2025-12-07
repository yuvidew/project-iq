
import { authRouter } from "@/features/auth/api/auth";
import { router } from "../trpc";

export const appRouter = router({
    auth: authRouter,
//   organization: organizationRouter,
});

export type AppRouter = typeof appRouter;
