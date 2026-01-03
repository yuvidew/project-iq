import { OrganizationBySlug, OrganizationBySlugErrorView, OrganizationBySlugLoadingView } from '@/features/organization-by-slug/_components/organization-by-slug';
import { organizationBySlugParamsLoader } from '@/features/organization-by-slug/server/params-loader';
import { prefetchOrganizationBySlug } from '@/features/organization-by-slug/server/prefetch';
import { requireAuth } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
    params: Promise<{
        slug: string
    }>,
    searchParams: Promise<SearchParams>
}

const OrganizationIdPage = async ({
    params,
    searchParams
}: Props) => {
    await requireAuth();

    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const organizationParams = await organizationBySlugParamsLoader(resolvedSearchParams);

    await prefetchOrganizationBySlug({
        ...organizationParams,
        slug,
    });

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<OrganizationBySlugErrorView />}>
                <Suspense fallback={<OrganizationBySlugLoadingView />}>
                    <OrganizationBySlug />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
};

export default OrganizationIdPage 
