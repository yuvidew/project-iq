

import { imageRouter } from "@/features/image/api";
import { router } from "../trpc";
import { organizationRouter } from "@/features/organization/server/routers";
import { userInfo } from "@/features/user/server/routers";

export const appRouter = router({
    image: imageRouter,
    organization : organizationRouter,
    userInfo: userInfo
});

export type AppRouter = typeof appRouter;
