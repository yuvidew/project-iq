"use client";

import { useTRPC } from "@/trpc/trpc-client-provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

// Hook to get project performance
export const useSuspenseProjectPerformance = () => {
    const trpc = useTRPC();
    const { id } = useParams<{ id?: string }>();

    if (!id) {
        throw new Error("Project id is required to load projects.");
    };

    return useSuspenseQuery(
        trpc.task.getProjectPerformance.queryOptions({projectId : id})
    )
}