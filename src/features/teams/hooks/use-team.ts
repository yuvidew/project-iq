import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTeamsParams } from "./use-teams-params";

/** Hook to invite a member to a team */
export const useInviteMember = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    const { slug } = useParams<{ slug?: string }>();
    if (!slug) {
        throw new Error("Organization slug is required to load organization details.");
    }

    return useMutation(
        trpc.teams.invite.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(
                    trpc.teams.getOrgDetails.queryOptions({
                        organizationSlug: slug,
                    }),
                );

                queryClient.invalidateQueries(
                    trpc.teams.getMany.queryOptions({
                        organizationSlug: slug,
                    }),
                );

                toast.success("Invitation sent successfully");
            },
            onError: (error) => {
                console.log("the invitation Error:", error);
                toast.error(error.message);
            },
        }),
    );
};

/** Hook to get organization details */
export const useSuspenseOrgDetails = () => {
    const trpc = useTRPC();
    const { slug } = useParams<{ slug?: string }>();
    if (!slug) {
        throw new Error("Organization slug is required to load organization details.");
    }
    return useSuspenseQuery(
        trpc.teams.getOrgDetails.queryOptions({
            organizationSlug: slug,
        }),
    );
};

/** Hook to get organization members */
export const useGetOrgMembers = () => {
    const trpc = useTRPC();
    const [params] = useTeamsParams();
    const { slug } = useParams<{ slug?: string }>();

    if (!slug) {
        throw new Error("Organization slug is required to load organization members.");
    }

    return useSuspenseQuery(
        trpc.teams.getMany.queryOptions({
            organizationSlug: slug,
            ...params,
        }),
    );
}