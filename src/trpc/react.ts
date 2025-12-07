import { useTRPC } from "@/trpc/trpc-client-provider";

export const trpc = {
  ...useTRPC(),
};
