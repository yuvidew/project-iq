
import { ProjectIdView, ProjectTaskErrorView, ProjectTaskLoadingView } from '@/features/project-by-id/_components/project-by-id';
import {  projectTasksParamsLoader } from '@/features/project-by-id/server/params-loader';
import { prefetchProjectTasks } from '@/features/project-by-id/server/prefetch';

import { requireAuth } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
    params: Promise<{
        id: string
    }>,
    searchParams: Promise<SearchParams>
}

const ProjectIdPage = async ({
    params,
    searchParams
}: Props) => {
    await requireAuth();

    const {id} = await params;
    const resolveSearchParams = await searchParams;
    const projectTasksParams = await projectTasksParamsLoader(resolveSearchParams);

    await prefetchProjectTasks({
        ...projectTasksParams,
        projectId: id,
        status : projectTasksParams.status ?? undefined,
        assigneeId : projectTasksParams.assigneeId
    });


    return (
        <HydrateClient>
            <ErrorBoundary fallback={<ProjectTaskErrorView />}>
                <Suspense fallback={<ProjectTaskLoadingView />} >
                    <ProjectIdView/>
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default ProjectIdPage
