import 'server-only'; // <-- ensure this file cannot be imported from the client
import {
    createTRPCOptionsProxy,
    TRPCInfiniteQueryOptions,
    TRPCQueryOptions,
    type ResolverDef,
} from '@trpc/tanstack-react-query';
import { cache } from 'react';;


import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { makeQueryClient } from './query-client';
import { appRouter } from '@/server/router';
import { headers } from "next/headers";
// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

// Build a TRPCContext for server-side usage (no direct request object available here)
const createServerTRPCContext = async () => {
    const incomingHeaders = await headers();
    // Convert ReadonlyHeaders to a plain object acceptable by Request init
    const headerObj = Object.fromEntries(incomingHeaders.entries());
    const req = new Request("http://localhost/api/trpc", { headers: headerObj });
    const resHeaders = new Headers();
    return {
        req,
        resHeaders,
        setCookie: (cookie: string) => resHeaders.append("Set-Cookie", cookie),
    };
};

export const trpc = createTRPCOptionsProxy({
    // Build a server-friendly context that carries current request headers (incl. cookies)
    ctx: createServerTRPCContext,
    router: appRouter,
    queryClient: getQueryClient,
});

// ...
export const caller = async () =>
    appRouter.createCaller(await createServerTRPCContext());


type TRPCQueryOptionsResult = ReturnType<TRPCQueryOptions<ResolverDef>>;
type TRPCInfiniteQueryOptionsResult = ReturnType<
    TRPCInfiniteQueryOptions<ResolverDef>
>;
type TRPCPrefetchOptions =
    | TRPCQueryOptionsResult
    | TRPCInfiniteQueryOptionsResult;

const isInfiniteQueryOptions = (
    options: TRPCPrefetchOptions,
): options is TRPCInfiniteQueryOptionsResult => {
    const second = options.queryKey[1];
    if (second && typeof second === "object" && "type" in second) {
        return second.type === "infinite";
    }
    return false;
};

export function prefetch(queryOptions: TRPCPrefetchOptions) {
    const queryClient = getQueryClient();
    if (isInfiniteQueryOptions(queryOptions)) {
        void queryClient.prefetchInfiniteQuery(queryOptions);
    } else {
        void queryClient.prefetchQuery(queryOptions);
    }
}

export function HydrateClient(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {props.children}
        </HydrationBoundary>
    );
}
