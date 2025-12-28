"use client";

import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOrganizationsParams } from "./use-organizations-params";


// Hooks for organization operations
export const useCreateOrganization = () => {
    const router = useRouter()
    const trpc = useTRPC();
    return useMutation(
        trpc.organization.createOrganization.mutationOptions({
            onSuccess: (data) => {
                toast.success("Organization created successfully");
                router.push(`/organizations/${data.slug}`)

            },
            onError: (data) => toast.error(data.message)
        })
    );
};

// // Hook to get list of organizations
export const useSuspenseOrganizations = () => {
    const trpc = useTRPC();
    const [params] = useOrganizationsParams();

    return useSuspenseQuery(trpc.organization.getOrganizations.queryOptions(params));
};

// Hook to get organization by ID
export const useGetOrganizationBySlug = (slug: string) => {
    const trpc = useTRPC();
    return useQuery(trpc.organization.getOrganizationBySlug.queryOptions(slug));
};

// Hook to update organization
export const useUpdateOrganization = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    return useMutation(
        trpc.organization.updateOrganization.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Organization "${data.name}" saved`);

                queryClient.invalidateQueries(
                    trpc.organization.getOrganizations.queryOptions({}),
                );

                queryClient.invalidateQueries(
                    trpc.organization.getOrganizationBySlug.queryFilter(data.slug),
                );
            },
            onError: (data) => toast.error(data.message)
        })
    );
};

// Hook to delete organization
export const useRemoveOrganization = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    return useMutation(
        trpc.organization.removeOrganization.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Organization "${data.name}" removed`);

                queryClient.invalidateQueries(
                    trpc.organization.getOrganizations.queryOptions({}),
                );

                queryClient.invalidateQueries(
                    trpc.organization.getOrganizationBySlug.queryFilter(data.slug),
                );
            },
            onError: (data) => toast.error(data.message)
        })
    );
};

// Hook to get organization members 
export const useSuspenseOrganizationMembers = () => {
    const trpc = useTRPC();
    return useQuery({
        ...trpc.organization.getOrganizationMembers.queryOptions(),
        retry: false,
    });
} 

