

import { imageRouter } from "@/features/image/api";
import { router } from "../trpc";
import { organizationRouter } from "@/features/organization/server/routers";

export const appRouter = router({
    image: imageRouter,
    organization : organizationRouter
});

export type AppRouter = typeof appRouter;
