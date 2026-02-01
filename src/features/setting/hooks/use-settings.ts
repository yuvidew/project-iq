import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useOrganizationBySlugParams } from "./use-settings-params";
import { toast } from "sonner";

export const useSuspenseOrganizationBySlugSetting = () => {
    const trpc = useTRPC();
    const { slug } = useParams<{ slug?: string }>();
    const [params] = useOrganizationBySlugParams();

    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    }

    return useSuspenseQuery(
        trpc.setting.getOrgBySlug.queryOptions({ slug, ...params })
    );
};

export const useGetAccessMembers = () => {
    const trpc = useTRPC();
    const { slug } = useParams<{ slug?: string }>();

    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    }

    return useQuery(
        trpc.setting.getOrgAccessMembers.queryOptions({ slug })
    )
};

export const useDeleteOrgBySlug = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { slug } = useParams<{ slug?: string }>();

    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    }


    return useMutation(
        trpc.setting.deleteOrganization.mutationOptions({
            onSuccess: (data) => {
                toast.success("Organization deleted successfully.");


                const orgSlug = data.slug;
                queryClient.invalidateQueries(
                    trpc.setting.getOrgBySlug.queryOptions({ slug: orgSlug })
                );
            },

            onError: (data) => {
                console.log("Organization Deletion Error:", data.message);
                toast.error(data.message);
            },
        })
    )
};