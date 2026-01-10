import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export const useInviteMember = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.teams.invite.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["teams"],
                });

                toast.success("Invitation sent successfully");
            },
            onError: (error) => {
                console.log("the invitation Error:", error);
                toast.error(error.message);
            },
        }),
    );
};

