import { useTRPC } from "@/trpc/trpc-client-provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useOrganizationBySlugParams } from "./use-organization-by-slug-params";

export const useSuspenseOrganizationBySlug = () => {
    const trpc = useTRPC();
    const { slug } = useParams<{ slug?: string }>();
    const [params] = useOrganizationBySlugParams();

    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    }

    return useSuspenseQuery(
        trpc.organizationBySlug.getOrganizationBySlug.queryOptions({ slug , ...params})
    );
}
