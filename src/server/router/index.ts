

import { imageRouter } from "@/features/image/api";
import { router } from "../trpc";
import { organizationRouter } from "@/features/organization/server/routers";
import { userInfo } from "@/features/user/server/routers";
import { projectRouter } from "@/features/projects/server/routers";
import { organizationMembersRouter } from '../../features/organization-members/server/routers';

export const appRouter = router({
    image: imageRouter,
    organization : organizationRouter,
    userInfo: userInfo,
    project : projectRouter,
    organizationMembers : organizationMembersRouter
});

export type AppRouter = typeof appRouter;
