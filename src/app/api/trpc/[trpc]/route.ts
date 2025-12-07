import { appRouter } from "../../../../server/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";


export const runtime = "edge";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
};

export { handler as GET, handler as POST };
