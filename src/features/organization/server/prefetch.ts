import { prefetch, trpc } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

/**
 * Prefetch all Organization
 */

export const prefetchOrganizations = (params : inferInput<typeof trpc.organization.getOrganizations>) => {
    return prefetch(trpc.organization.getOrganizations.queryOptions(params));
};

/**
 * Prefetch a single Organization
 */

export const prefetchOrganization = (slug : string) => {
    return prefetch(trpc.organization.getOrganizationBySlug.queryOptions(slug));
}
