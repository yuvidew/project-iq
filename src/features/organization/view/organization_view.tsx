"use client";


import { OrganizationWrapper } from "../_components/organization_wrapper";
import { SearchBox } from "@/components/search_box";
import { OrganizationItem } from "../_components/organization_item";
import { OrganizationPagination } from "../_components/organization_pagination";

export const OrganizationView = () => {


    return (
        <OrganizationWrapper
            search={<SearchBox placeholder="Search organizations..." />}
            pagination={<OrganizationPagination page={1} totalPages={10} onPageChange={() => {}} />}
        >
            <OrganizationItem/>
        </OrganizationWrapper>
    );
};
