import { trpc } from "@/trpc/react";
import { prefetch } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";
;

type Input = inferInput<typeof trpc.organization.getOrganizations>;

/**
 * Prefetch all credential
 */

export const prefetchCredentials = (params : Input) => {
    return prefetch(trpc.organization.getOrganizations.queryOptions(params));
};

/**
 * Prefetch a single credential
 */

export const prefetchCredential = (id : number) => {
    return prefetch(trpc.organization.getOrganizationById.queryOptions(id));
}
