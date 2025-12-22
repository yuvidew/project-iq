// Hook to get the user into

import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hook to get user details
export const useUserDetails = () => {
    const trpc = useTRPC();

    return useQuery(trpc.userInfo.getUserInfo.queryOptions());
};

// Hook to switch org
export const useSwitchUserActiveOrg = () => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.userInfo.switchUserActiveOrg.mutationOptions({
            onSuccess: (data) => {
                queryClient.invalidateQueries(
                    trpc.userInfo.getUserInfo.queryOptions(),
                );

                router.replace(`/organizations/${data.organization.slug}`)
            },

            onError : (error) => {
                toast.error(error.message)
            }
        }),
    );
};
