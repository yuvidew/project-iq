// app/api/trpc/[trpc]/trpc-context.ts (or your current path)

export type TRPCContext = {
  req: Request;
  resHeaders: Headers;
  setCookie: (cookie: string) => void;
};

export const createTRPCContext = ({ req }: { req: Request }): TRPCContext => {
  const resHeaders = new Headers();

  return {
    req,
    resHeaders,
    setCookie(cookie: string) {
      resHeaders.append("Set-Cookie", cookie);
    },
  };
};
