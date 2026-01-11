import {
    TeamsErrorView,
    TeamsLoadingView,
    TeamsView,
} from "@/features/teams/_components/teams";
import { teamsParamsLoader } from "@/features/teams/server/params-loader";
import { prefetchTeams } from "@/features/teams/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

const TeamPage = async ({ params }: Props) => {
    await requireAuth();

    const { slug } = await params;
    const teamsParams = await teamsParamsLoader({ organizationSlug: slug });

    await prefetchTeams({
        ...teamsParams,
        organizationSlug: slug,
    });

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<TeamsErrorView />}>
                <Suspense fallback={<TeamsLoadingView />}>
                    <TeamsView />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    );
};

export default TeamPage;
