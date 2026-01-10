

import { imageRouter } from "@/features/image/api";
import { router } from "../trpc";
import { organizationRouter } from "@/features/organization/server/routers";
import { userInfo } from "@/features/user/server/routers";
import { projectRouter } from "@/features/projects/server/routers";
import { organizationMembersRouter } from '../../features/organization-members/server/routers';
import { taskRouter } from "@/features/project-by-id/server/routers";
import { organizationBySlugRouter } from "@/features/organization-by-slug/server/routers";
import { teamsRouter } from "@/features/teams/server/routers";

export const appRouter = router({
    image: imageRouter,
    organization : organizationRouter,
    userInfo: userInfo,
    project : projectRouter,
    organizationMembers : organizationMembersRouter,
    organizationBySlug : organizationBySlugRouter,
    task : taskRouter,
    teams : teamsRouter
});

export type AppRouter = typeof appRouter;
