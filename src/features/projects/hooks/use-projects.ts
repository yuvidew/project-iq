"use client"

import { useParams } from "next/navigation"
import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectsParams } from "./use-projects-params";

// Hook to create project
export const useCreateProject = () =>{ 
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { slug } = useParams<{ slug?: string }>();

    return useMutation(
        trpc.project.create.mutationOptions({
            onSuccess : (data) => {
                toast.success("Project created successfully");

                const organizationSlug = data.organizationSlug ?? slug;
                if (organizationSlug) {
                    queryClient.invalidateQueries(
                        trpc.project.getMany.queryOptions({ organizationSlug })
                    );
                }
                // router.push(`/project/${data.id}`);
            },
            onError: (data) => {
                console.log("the error data" , data.message);
                toast.error(data.message);
            },
        })
    )
};

// Hook to get list of projects
export const useSuspenseProjects = () => {
    const trpc = useTRPC();
    const [params] = useProjectsParams();
    const { slug } = useParams<{ slug?: string }>();

    if (!slug) {
        throw new Error("Organization slug is required to load projects.");
    }

    const queryInput = {
        ...params,
        status: params.status ?? undefined,
        priority: params.priority ?? undefined,
        organizationSlug: slug,
    };

    return useSuspenseQuery(
        trpc.project.getMany.queryOptions(queryInput)
    )
};

// Hook to update project
export const useUploadProject = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { slug } = useParams<{ slug?: string }>();

    return useMutation(
        trpc.project.update.mutationOptions({
            onSuccess : (data) => {
                toast.success(`Project "${data.name}" saved`);

                const organizationSlug = data.organizationSlug ?? slug;
                if (organizationSlug) {
                    queryClient.invalidateQueries(
                        trpc.project.getMany.queryOptions({ organizationSlug })
                    );
                }

                // TODO: also call getOne
            },
            onError: (data) => toast.error(data.message),
        })
    );
};

// Hook to delete project
export const useRemoveProject = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { slug } = useParams<{ slug?: string }>();

    return useMutation(
        trpc.project.remove.mutationOptions({
            onSuccess : (data) => {
                toast.success(`Project "${data.name}" removed`);

                const organizationSlug = data.organizationSlug ?? slug;
                if (organizationSlug) {
                    queryClient.invalidateQueries(
                        trpc.project.getMany.queryOptions({ organizationSlug })
                    );
                }

                // TODO: also call getOne
            }
        })
    )
}
