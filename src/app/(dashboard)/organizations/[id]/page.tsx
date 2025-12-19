import React from 'react';

interface Props {
    params: Promise<{
        id: string
    }>
}

const OrganizationIdPage = ({ params }: Props) => {
    return (
        <div>OrganizationIdPage</div>
    )
};

export default OrganizationIdPage 
