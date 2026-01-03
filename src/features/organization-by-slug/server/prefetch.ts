import { prefetch, trpc } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

/**
 * Prefetch organization dashboard (by slug) with optional search params.
 */
export const prefetchOrganizationBySlug = (
    params: inferInput<typeof trpc.organizationBySlug.getOrganizationBySlug>
) => {
    return prefetch(trpc.organizationBySlug.getOrganizationBySlug.queryOptions(params));
};
