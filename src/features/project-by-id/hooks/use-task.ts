"use client"

import { useTRPC } from "@/trpc/trpc-client-provider";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTaskParams } from "./use-taks-params";

// Hook to create task
export const useCreateTask = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { id } = useParams<{ id?: string }>();

    return useMutation(
        trpc.task.create.mutationOptions({
            onSuccess: (data) => {
                toast.success("Task created successfully");

                queryClient.invalidateQueries(
                    trpc.task.getMany.queryOptions({ projectId: data.projectId ?? id })
                );
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
    const { id } = useParams<{ id?: string }>();

    return useMutation(
        trpc.task.create.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Task "${data.name}" saved`);

                queryClient.invalidateQueries(
                    trpc.task.getMany.queryOptions({ projectId: data.projectId ?? id })
                );
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
    const { id } = useParams<{ id?: string }>();

    return useMutation(
        trpc.task.remove.mutationOptions({
            onSuccess : (data) => {
                toast.success(`task "${data.name}" removed`);

                const projectId = data.projectId ?? id;
                if (projectId) {
                    queryClient.invalidateQueries(
                        trpc.task.getMany.queryOptions({ projectId })
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