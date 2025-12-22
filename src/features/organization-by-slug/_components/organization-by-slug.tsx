import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";

export const OrganizationBySlugErrorView = () => {
    return <ErrorView message='Error loading organizations' />
};

export const OrganizationBySlugLoadingView = () => {
    return <LoadingView message='Loading organizations...' />
};

