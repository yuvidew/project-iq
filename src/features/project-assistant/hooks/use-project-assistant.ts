"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/trpc-client-provider";

export const useProjectAssistantSessions = ({
  enabled = true,
  projectId,
}: {
  enabled?: boolean;
  projectId?: string;
}) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.projectAssistant.getSessions.queryOptions({
      projectId: projectId ?? "",
    }),
    enabled: Boolean(enabled && projectId),
  });
};

export const useProjectAssistantMessages = ({
  enabled = true,
  projectId,
  sessionId,
}: {
  enabled?: boolean;
  projectId?: string;
  sessionId?: string;
}) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.projectAssistant.getMessages.queryOptions({
      projectId: projectId ?? "",
      sessionId: sessionId ?? "",
    }),
    enabled: Boolean(enabled && projectId && sessionId),
  });
};

export const useCreateProjectAssistantSession = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.projectAssistant.createSession.mutationOptions({
      onSuccess: (session) => {
        queryClient.invalidateQueries(
          trpc.projectAssistant.getSessions.queryOptions({
            projectId: session.projectId,
          }),
        );
      },
      onError: (error) => {
        console.log("Project assistant session creation Error:", error.message);
        toast.error(error.message);
      },
    }),
  );
};

export const useSendProjectAssistantMessage = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.projectAssistant.sendMessage.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.projectAssistant.getSessions.queryOptions({
            projectId: data.session.projectId,
          }),
        );
        queryClient.invalidateQueries(
          trpc.projectAssistant.getMessages.queryOptions({
            projectId: data.session.projectId,
            sessionId: data.session.id,
          }),
        );
      },
      onError: (error) => {
        console.log("Project assistant message Error:", error.message);
        toast.error(error.message);
      },
    }),
  );
};
