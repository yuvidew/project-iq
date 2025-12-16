
import { appRouter } from "../../../../server/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext, type TRPCContext } from "./trpc-context";


export const runtime = "edge";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    responseMeta({ ctx }: { ctx?: TRPCContext }) {
      // forward cookies set inside procedures
      return {
        headers: ctx?.resHeaders,
      };
    },
  });
};

export { handler as GET, handler as POST };
