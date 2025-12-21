"use client"

import { useEffect, useState } from "react"
import {
    ChevronsUpDown,
    GalleryVerticalEndIcon,
    Plus,
    UsersIcon,
} from "lucide-react"
import { useSuspenseOrganizationMembers } from "@/features/organization/hooks/use-organization"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"

export function OrgSwitcher() {
    const { isMobile } = useSidebar()
    const { data: organizations = [], isFetching } = useSuspenseOrganizationMembers()
    const [open, setOpen] = useState(false)
    const [activeId, setActiveId] = useState<number | null>(null)

    useEffect(() => {
        if (organizations.length > 0 && (activeId === null || !organizations.some((org) => org.id === activeId))) {
            setActiveId(organizations[0].id)
        }
    }, [organizations, activeId])

    const activeOrg = organizations.find((org) => org.id === activeId)

    if (!activeOrg) return null

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu
                    open={isFetching ? false : open}
                    onOpenChange={(next) => {
                        if (!isFetching) setOpen(next)
                    }}
                >
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            disabled={isFetching}
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                {isFetching ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <GalleryVerticalEndIcon className="size-4" />
                                )}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{activeOrg.name}</span>
                                <span className="truncate text-xs text-muted-foreground">{activeOrg.slug}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">Organizations</DropdownMenuLabel>
                        {organizations.map((org, index) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => setActiveId(org.id)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <GalleryVerticalEndIcon className="size-3.5 shrink-0" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="truncate">{org.name}</span>
                                    <span className="text-muted-foreground text-xs truncate flex items-center gap-1">
                                        <UsersIcon className="size-3" />
                                        {org.memberCount.members ?? 0} member{(org.memberCount.members ?? 0) === 1 ? "" : "s"}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4" />
                            </div>
                            <div className="text-muted-foreground font-medium">Add organization</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}