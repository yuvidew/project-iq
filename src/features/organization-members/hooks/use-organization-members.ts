import { useTRPC } from "@/trpc/trpc-client-provider";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation";

// Hook to get organization members
export const useOrgMembers = () => {
    const trpc = useTRPC();
    const params = useParams();
    const slug = typeof params.slug === "string" ? params.slug : undefined;

    return useQuery({
        ...trpc.organizationMembers.getMany.queryOptions(slug as string),
        enabled: Boolean(slug),
    });
};
