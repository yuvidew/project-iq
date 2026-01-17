import { InviteErrorView, InviteLoadingView, InviteView } from "@/features/invite/_components/invite";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";


const InvitePage = async () => {
    await requireAuth();



    return (
        <HydrateClient>
            <ErrorBoundary fallback={<InviteErrorView />}>
                <Suspense fallback={<InviteLoadingView />}>
                    <InviteView />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
};

export default InvitePage;
