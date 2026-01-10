
import { OrganizationErrorView, OrganizationLoadingView } from '@/features/organization/_components/organization';
import { organizationParamsLoader } from '@/features/organization/server/params-loader';
import { prefetchOrganizations } from '@/features/organization/server/prefetch';
import { OrganizationView } from '@/features/organization/view/organization-view';
import { requireAuthAndResolveOrg } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';


type Props = {
  searchParams: Promise<SearchParams>
}

/**
 * Server-side organization page that preloads data and renders with suspense boundaries.
 * @param {Props} props Component properties.
 * @param {Promise<SearchParams>} props.searchParams Incoming search params promise from the route.
 */

export default async function OrganizationsPage({
  searchParams
}: Props) {
  await requireAuthAndResolveOrg();

  const params = await organizationParamsLoader(searchParams)
  prefetchOrganizations(params)

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<OrganizationErrorView/>}>
        <Suspense fallback={<OrganizationLoadingView/>}>
          <OrganizationView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}