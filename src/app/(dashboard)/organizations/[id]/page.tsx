import { OrganizationIdView } from '@/features/organization-by-slug/view/organization-id-view';
import { requireAuth } from '@/lib/auth-utils';

interface Props {
    params: Promise<{
        id: string
    }>
}

const OrganizationIdPage = async ({ params }: Props) => {
    await requireAuth()
    return (
        <OrganizationIdView/>
    )
};

export default OrganizationIdPage 
