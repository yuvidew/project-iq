import { ProjectErrorView, ProjectLoadingView } from '@/features/projects/_components/projects';
import { projectParamsLoader } from '@/features/projects/server/params-loader';
import { prefetchProjects } from '@/features/projects/server/prefetch';
import { ProjectView } from '@/features/projects/view/ProjectView'
import { requireAuth } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
    params: Promise<{
        slug: string,
    }>,
    searchParams: Promise<SearchParams>
}

const ProjectPage = async ({
    params,
    searchParams
}: Props) => {
    await requireAuth();

const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const projectParams = await projectParamsLoader(resolvedSearchParams);

    await prefetchProjects({
        ...projectParams,
        organizationSlug: slug,
        status: projectParams.status ?? undefined,
        priority: projectParams.priority ?? undefined
    });

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<ProjectErrorView />}>
                <Suspense fallback={<ProjectLoadingView />} >
                    <ProjectView />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default ProjectPage
