import { prefetch, trpc } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

/**
 * Prefetch all Projects
 */

export const prefetchProjects = (params : inferInput<typeof trpc.project.getMany>) =>{
    return prefetch(trpc.project.getMany.queryOptions(params));
};