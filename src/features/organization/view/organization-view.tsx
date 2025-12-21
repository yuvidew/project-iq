"use client";

import { useState } from "react";
import { CreateOrganizationForm } from "../_components/create-organization-form";
import { OrganizationItem, OrganizationPagination, OrganizationSearch, OrganizationWrapper } from "../_components/organization";
import { ItemsType } from "../types/type";



type EditableOrganization = Pick<ItemsType, "id" | "name" | "description" | "slug" | "logoUrl">;

export const OrganizationView = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<EditableOrganization | null>(null);

    const handleCreate = () => {
        setEditingOrg(null);
        setDialogOpen(true);
    };

    const handleRename = (org: ItemsType) => {
        setEditingOrg({
            id: org.id,
            name: org.name,
            description: org.description,
            slug: org.slug,
            logoUrl: org.logoUrl,
        });
        setDialogOpen(true);
    };

    return (
        <>
            <OrganizationWrapper
                search={<OrganizationSearch />}
                pagination={<OrganizationPagination />}
                onCreate={handleCreate}
            >
                <OrganizationItem onRename={handleRename} onNew={handleCreate} />
            </OrganizationWrapper>

            <CreateOrganizationForm
                open={dialogOpen}
                setOpen={setDialogOpen}
                initialData={editingOrg || undefined}
            />
        </>
    );
};
