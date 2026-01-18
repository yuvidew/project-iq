// app/api/trpc/[trpc]/trpc-context.ts (or your current path)

import { createSessionClient } from "@/server/appwriter";
import type { Storage } from "node-appwrite";

export type TRPCContext = {
  req: Request;
  resHeaders: Headers;
  setCookie: (cookie: string) => void;
  storage: Storage | null;
};

export const createTRPCContext = async ({ req }: { req: Request }): Promise<TRPCContext> => {
  const resHeaders = new Headers();
  const sessionClient = await createSessionClient({ optional: true });

  return {
    req,
    resHeaders,
    setCookie(cookie: string) {
      resHeaders.append("Set-Cookie", cookie);
    },
    storage: sessionClient?.storage ?? null,
  };
};
