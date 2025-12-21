"use client"

import { ErrorView } from '@/components/error-view'
import { LoadingView } from '@/components/loading-view';

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

import { FolderOpenIcon } from 'lucide-react'
import { PackageOpenIcon, PlusIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useOrganizationsParams } from '../hooks/use-organizations-params';
import { useRemoveOrganization, useSuspenseOrganizations } from '../hooks/use-organization';
import { Pagination } from '@/components/ui/pagination';
import { OrganizationCard } from "./organization-card";
import { SearchWithDropdown } from '@/components/search-with-dropdown';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ReactNode } from "react";
import { ItemsType } from '../types/type';


export const OrganizationErrorView = () => {
    return <ErrorView message='Error loading organizations' />
};

export const OrganizationLoadingView = () => {
    return <LoadingView message='Loading organizations...' />
};

interface Props {
    onNew?: () => void;
    message: string;
    isLoading?: boolean;
    label?: string;
    empty_label?: string;
}

/**
 * Renders an empty state with optional call-to-action for creating a new item.
 * @param {Props} props Component properties.
 * @param {string} props.message Message explaining the empty state.
 * @param {() => void} [props.onNew] Optional handler to trigger creating a new item.
 */
const OrganizationEmptyView = ({
    message,
    onNew,
    isLoading = false,
    label = "Add item",
    empty_label = "No items"
}: Props) => {
    return (
        <div className=" w-md m-auto">
            <Empty className=" border border-dashed border-primary dark:bg-background ">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <PackageOpenIcon />
                    </EmptyMedia>
                    <EmptyTitle>{empty_label}</EmptyTitle>
                    {!!message && <EmptyDescription>{message}</EmptyDescription>}
                </EmptyHeader>
                {!!onNew && (
                    <EmptyContent>
                        <Button onClick={onNew} disabled={isLoading}>
                            {isLoading ?
                                (
                                    <>
                                        <Spinner className=" size-4" />
                                        Adding...
                                    </>
                                )
                                :
                                (
                                    <>
                                        <PlusIcon className="size-4" />
                                        {label ? label : "Add item"}
                                    </>
                                )
                            }
                        </Button>
                    </EmptyContent>
                )}
            </Empty>
        </div>
    );
};

export const OrganizationSearch = () => {
    const { isFetching, data } = useSuspenseOrganizations();
    return(
            <SearchWithDropdown 
                isLoading = {isFetching}
                list={data.items.map(({ name, id }) => ({
                    value: name,
                    label: name,
                    id
                }))} 
            />
    )
}

export const OrganizationPagination = () => {
    const { isFetching, data } = useSuspenseOrganizations();
    const [params, setParams] = useOrganizationsParams();
    return (
        <Pagination
            disabled={isFetching}
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(page) => setParams({
                ...params,
                page
            })}
        />
    );
};


interface OrganizationItemProps {
    onRename?: (org: ItemsType) => void;
    onNew?: () => void;
}

export const OrganizationItem = ({ onRename, onNew }: OrganizationItemProps) => {
    const { data } = useSuspenseOrganizations();
    const { mutate: onRemove } = useRemoveOrganization()


    if (data.items.length === 0) {
        return (
            <OrganizationEmptyView
                message="No organizations found."
                onNew={onNew}
                label="Create organization"
                empty_label="No organizations"
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((org) => (
                <OrganizationCard
                    key={org.id}
                    {...org}
                    onRename={() => onRename?.(org)}
                    onDelete={() => onRemove({ organizationId: org.id })}

                />
            )
            )}
        </div>
    )
};


interface OrganizationWrapperProps {
    search: ReactNode;
    pagination: ReactNode;
    children: ReactNode;
    onCreate: () => void;
}

/**
 * Layout wrapper for the organization directory page sections.
 * @param search Search box component node.
 * @param pagination Pagination controls component node.
 * @param children Main content node containing cards/list.
 * @example
 * ```tsx
 * <OrganizationWrapper
 *   search={<SearchBox />}
 *   pagination={<Pagination />}
 * >
 *   <OrganizationList />
 * </OrganizationWrapper>
 * ```
 */
export const OrganizationWrapper = ({ search, pagination, children, onCreate }: OrganizationWrapperProps) => {
    const isMobile = useIsMobile();
    return (
        <main className="h-screen  py-12  px-4 ">
            <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full pb-10">
                <section className="flex flex-col items-start justify-start ">
                    <Button size="icon">
                        <FolderOpenIcon />
                    </Button>
                    <h1 className="text-xl font-bold  mb-4 mt-5">
                        ProjectIQ Organization Directory
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        A centralized directory for discovering, organizing, and analyzing
                        all organizations connected with ProjectIQ.
                    </p>
                </section>


                <section className=" flex flex-col gap-4 h-full justify-between">

                    {/* start to search box */}
                    <div className=' flex items-center justify-end gap-3'>
                        {search}

                        {/* start to create organization button */}
                        <Button size={isMobile ? "icon" : "default"} onClick={onCreate}>
                            <PlusIcon className=" size-4" />
                            {!isMobile && "Create Organization"}
                        </Button>
                        {/* end to create organization button */}
                    </div>
                    {/* end to search box */}

                    {children}


                    {/* start to pagination */}
                    {pagination}
                    {/* end to pagination */}
                </section>
            </div>

        </main>
    )
}






