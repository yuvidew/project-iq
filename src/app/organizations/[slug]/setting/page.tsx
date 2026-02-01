import { organizationBySlugParamsLoader } from '@/features/organization-by-slug/server/params-loader';
import { prefetchOrganizationBySlug } from '@/features/organization-by-slug/server/prefetch';
import { SettingErrorView, SettingLoadingView, SettingView } from '@/features/setting/_components/setting'
import { requireAuth } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
    params: Promise<{
        slug: string
    }>,
}

const SettingPage = async ({ params }: Props) => {
    await requireAuth();
    const { slug } = await params;

    await prefetchOrganizationBySlug({
        slug,
    });
    return (
        <HydrateClient>
            <ErrorBoundary fallback={<SettingErrorView />}>
                <Suspense fallback={<SettingLoadingView />}>
                    <SettingView />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default SettingPage