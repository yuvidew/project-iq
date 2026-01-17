import { prefetch, trpc } from "@/trpc/server";

export const prefetchOrganization = (slug : string) => {

    return prefetch(trpc.organization.getOrganizationBySlug.queryOptions(slug));
}