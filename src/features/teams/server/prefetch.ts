import { prefetch, trpc } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

/**
 * Prefetch all Teams
 */

export const prefetchTeams = async (params : inferInput<typeof trpc.teams.getMany>) => {
    return prefetch(trpc.teams.getMany.queryOptions(params));
};
