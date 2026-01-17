import { InviteErrorView, InviteLoadingView, InviteView } from "@/features/invite/_components/invite";
import { requireInviteAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ organization?: string }>;
}


const InvitePage = async ({ params, searchParams }: Props) => {
    const { token } = await params;
    const { organization: organizationName } = await searchParams;


    await requireInviteAuth(token , organizationName);




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
