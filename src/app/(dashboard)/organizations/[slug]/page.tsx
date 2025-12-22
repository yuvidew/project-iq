import { OrganizationBySlugErrorView, OrganizationBySlugLoadingView } from '@/features/organization-by-slug/_components/organization-by-slug';
import { OrganizationBySlug } from '@/features/organization-by-slug/view/organization-by-slug';
import { requireAuth } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
    params: Promise<{
        slug: string
    }>
}

const OrganizationIdPage = async ({ params }: Props) => {
    await requireAuth();
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
