'use client';
// ^-- to make sure we can mount the Provider from a server component
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import {
    createTRPCClient,
    httpBatchLink,
    httpBatchStreamLink,
} from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import superjson from 'superjson';
import { makeQueryClient } from '../server/query-client';
import type { AppRouter } from '@/server/router';


export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();


const includeCredentialsFetch: typeof fetch = (input, init) =>
    fetch(input, { ...init, credentials: 'include' });

let browserQueryClient: QueryClient;
function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return makeQueryClient();
    }
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}
function getUrl() {
    const base = (() => {
        if (typeof window !== 'undefined') return '';
        if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
        return 'http://localhost:3000';
    })();
    return `${base}/api/trpc`;
}
type TRPCReactProviderProps = Readonly<{
    children: React.ReactNode;
    /**
     * Headers from the incoming request (server render only).
     * Ensures SSR queries forward cookies for auth.
     */
    headers?: HeadersInit;
}>;

export function TRPCReactProvider({
    children,
    headers: initialHeaders,
}: TRPCReactProviderProps) {
    // NOTE: Avoid useState when initializing the query client if you don't
    //       have a suspense boundary between this and the code that may
    //       suspend because React will throw away the client on the initial
    //       render if it suspends and there is no boundary
    const queryClient = getQueryClient();
    const [trpcClient] = useState(() =>
        createTRPCClient<AppRouter>({
            links: [
                typeof window !== 'undefined'
                    ? httpBatchStreamLink({
                        transformer: superjson,
                        url: getUrl(),
                        fetch: includeCredentialsFetch,
                    })
                    : httpBatchLink({
                        transformer: superjson,
                        url: getUrl(),
                        // Forward incoming request headers (cookies) during SSR
                        headers() {
                            return initialHeaders ?? {};
                        },
                        fetch: (input, init) =>
                            includeCredentialsFetch(input, {
                                ...init,
                                headers: {
                                    ...(init?.headers ?? {}),
                                    ...(initialHeaders ?? {}),
                                },
                            }),
                    }),
            ],
        }),
    );
    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {children}
            </TRPCProvider>
        </QueryClientProvider>
    );
}
