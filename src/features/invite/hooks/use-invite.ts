import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hook to accept invitation
export const useAcceptInvitation = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const navigate = useRouter();

    return useMutation(
        trpc.invite.accept.mutationOptions({
            onSuccess: (data) => {
                toast.success("Welcome to the organization 🎉");


                const organizationSlug = data.organizationSlug;
                if (organizationSlug) {
                    queryClient.invalidateQueries(
                        trpc.organizationBySlug.getOrganizationBySlug.queryOptions({
                            slug: organizationSlug as string,
                            search: "",
                        }),
                    );

                    navigate.push(`/organizations/${organizationSlug}`);
                }
            },
            onError: (data) => {
                console.log("the error data", data.message);
                toast.error(data.message);
            },
        }),
    );
};

// Hook to accept invitation
export const useDeclineInvitation = () => {
    const trpc = useTRPC();
    const navigate = useRouter();

    return useMutation(
        trpc.invite.decline.mutationOptions({
            onSuccess: (data, variables) => {
                toast.success("Invitation declined successfully");

                if (typeof window !== "undefined" && variables?.token) {
                    window.dispatchEvent(
                        new CustomEvent("invitationDeclined", {
                            detail: { token: variables.token },
                        }),
                    );
                }

                navigate.push(`/organizations/${data.slug}`);
            },
            onError: (data) => {
                console.log("the error data", data.message);
                toast.error(data.message);
            },
        }),
    );
}
