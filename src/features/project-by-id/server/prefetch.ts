import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

/**
 * Prefetch all Projects Tasks
 */
export const prefetchProjectTasks = async (params : inferInput<typeof trpc.task.getMany>) => {
    return prefetch(trpc.task.getMany.queryOptions(params))
}