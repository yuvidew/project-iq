import { OrganizationIdView } from '@/features/organization-by-slug/view/organization-id-view';

interface Props {
    params: Promise<{
        id: string
    }>
}

const OrganizationIdPage = ({ params }: Props) => {
    return (
        <OrganizationIdView/>
    )
};

export default OrganizationIdPage 
