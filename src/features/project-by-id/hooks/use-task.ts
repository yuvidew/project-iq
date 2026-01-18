"use client"

import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTaskParams } from "./use-taks-params";

// Hook to create task
export const useCreateTask = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { id, slug } = useParams<{ id?: string; slug?: string }>();


    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    };

    return useMutation(
        trpc.task.create.mutationOptions({
            onSuccess: (data) => {
                toast.success("Task created successfully");

                const projectId = id ?? data.projectId?.[0];
                if (projectId) {
                    queryClient.invalidateQueries(
                        trpc.task.getMany.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getProjectPerformance.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getMyTasks.queryOptions({
                            organizationSlug: slug
                        }),
                    );
                }
            },

            onError: (data) => {
                console.log("Task Creation Error:", data.message);
                toast.error(data.message);
            },
        }),
    );
};


// Hook to get task
export const useSuspenseTasks = () => {
    const trpc = useTRPC();
    const [params] = useTaskParams();
    const { id } = useParams<{ id?: string }>();

    if (!id) {
        throw new Error("Project id is required to load projects.");
    };

    const queryInput = {
        ...params,
        status: params.status ?? undefined,
        assigneeId: params.assigneeId ?? undefined,
        projectId: id,
    };

    return useSuspenseQuery(
        trpc.task.getMany.queryOptions(queryInput)
    );
};


// Hook to update project
export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { id, slug } = useParams<{ id?: string; slug?: string }>();


    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    };

    return useMutation(
        trpc.task.update.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Task "${data.name}" saved`);

                const projectId = id ?? data.projectId?.[0];
                if (projectId) {
                    queryClient.invalidateQueries(
                        trpc.task.getMany.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getProjectPerformance.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getMyTasks.queryOptions({
                            organizationSlug: slug
                        }),
                    );
                }
            },

            onError: (data) => {
                console.log("Task update Error:", data.message);
                toast.error(data.message);
            },
        }),
    );
};

// Hook to remove task
export const useRemoveTask = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { id, slug } = useParams<{ id?: string; slug?: string }>();


    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    };

    return useMutation(
        trpc.task.remove.mutationOptions({
            onSuccess: (data) => {
                toast.success(`task "${data.name}" removed`);

                const projectId = data.projectId ?? id;
                if (projectId) {
                    queryClient.invalidateQueries(
                        trpc.task.getMany.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getProjectPerformance.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getMyTasks.queryOptions({
                            organizationSlug: slug
                        }),
                    );
                }

                // TODO: also call getOne
            },
            onError: (data) => {
                console.log("Task remove Error:", data.message);
                toast.error(data.message);
            },
        })
    )
}

// Hook to update task position
export const useChangeTaskPositionStatus = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { id, slug } = useParams<{ id?: string; slug?: string }>();


    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    };

    return useMutation(
        trpc.task.changePosition.mutationOptions({
            onSuccess: (data) => {
                toast.success("Tasks reordered");

                const projectId = id ?? data.projectIds?.[0];
                if (projectId) {
                    queryClient.invalidateQueries(
                        trpc.task.getMany.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getProjectPerformance.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getMyTasks.queryOptions({
                            organizationSlug: slug
                        }),
                    );
                }
            },
            onError: (data) => {
                console.log("Task moved Error:", data.message);
                toast.error(data.message);
            },
        })
    )
}

// Hook to remove all task
export const useRemoveAllTasks = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { id, slug } = useParams<{ id?: string; slug?: string }>();


    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    };

    return useMutation(
        trpc.task.removeAll.mutationOptions({
            onSuccess: () => {
                toast.success("Tasks  removed");

                const projectId = id;
                if (projectId) {
                    queryClient.invalidateQueries(
                        trpc.task.getMany.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getProjectPerformance.queryOptions({ projectId })
                    );

                    queryClient.invalidateQueries(
                        trpc.task.getMyTasks.queryOptions({
                            organizationSlug: slug
                        }),
                    );
                }
            },
            onError: (data) => {
                console.log("Task moved Error:", data.message);
                toast.error(data.message);
            },
        }),
    );
};

// Hook to get my tasks
export const useGetMyTasks = () => {
    const trpc = useTRPC();
    const { slug } = useParams<{ slug?: string }>();

    if (!slug) {
        throw new Error("Organization slug is required to load organization.");
    };

    return useQuery(
        trpc.task.getMyTasks.queryOptions({
            organizationSlug: slug
        }),
    );
};