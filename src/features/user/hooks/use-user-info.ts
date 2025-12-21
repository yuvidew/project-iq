// Hook to get the user into

import { useTRPC } from "@/trpc/trpc-client-provider";
import { useQuery } from "@tanstack/react-query";

export const useUserDetails = () => {
    const trpc = useTRPC();

    return useQuery(trpc.userInfo.getUserInfo.queryOptions());
}