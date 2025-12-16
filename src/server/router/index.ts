
import { authRouter } from "@/features/auth/api/auth";
import { imageRouter } from "@/features/image/api";
import { router } from "../trpc";
import { organizationRouter } from "@/features/organization/api";

export const appRouter = router({
    auth: authRouter,
    image: imageRouter,
    organization : organizationRouter
});

export type AppRouter = typeof appRouter;
