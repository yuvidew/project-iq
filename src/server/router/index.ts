import { imageRouter } from "@/features/image/api";
import { inviteRouter } from "@/features/invite/server/routers";
import { organizationRouter } from "@/features/organization/server/routers";
import { organizationBySlugRouter } from "@/features/organization-by-slug/server/routers";
import { projectAssistantRouter } from "@/features/project-assistant/server/routers";
import { taskRouter } from "@/features/project-by-id/server/routers";
import { projectRouter } from "@/features/projects/server/routers";
import { settingRouter } from "@/features/setting/server/routers";
import { teamsRouter } from "@/features/teams/server/routers";
import { userInfo } from "@/features/user/server/routers";
import { organizationMembersRouter } from "../../features/organization-members/server/routers";
import { router } from "../trpc";

export const appRouter = router({
  image: imageRouter,
  organization: organizationRouter,
  userInfo: userInfo,
  project: projectRouter,
  organizationMembers: organizationMembersRouter,
  organizationBySlug: organizationBySlugRouter,
  task: taskRouter,
  teams: teamsRouter,
  invite: inviteRouter,
  setting: settingRouter,
  projectAssistant: projectAssistantRouter,
});

export type AppRouter = typeof appRouter;
