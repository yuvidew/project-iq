
import { authRouter } from "@/features/auth/api/auth";
import { imageRouter } from "@/features/image/api";
import { router } from "../trpc";

export const appRouter = router({
    auth: authRouter,
    image: imageRouter,
});

export type AppRouter = typeof appRouter;
