"use client";


import { OrganizationWrapper } from "../_components/organization_wrapper";
import { SearchBox } from "@/components/search_box";
import { OrganizationPagination } from "../_components/organization_pagination";
import { OrganizationEmptyView } from "../_components/organization_empty_view";

export const OrganizationView = () => {


    return (
        <OrganizationWrapper
            search={<SearchBox placeholder="Search organizations..." />}
            pagination={<OrganizationPagination page={1} totalPages={10} onPageChange={() => {}} />}
        >
            <OrganizationEmptyView message="No organizations found." />
            {/* <OrganizationItem/> */}
        </OrganizationWrapper>
    );
};
