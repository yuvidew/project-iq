"use client"

import { useEffect, useMemo, useState } from "react"
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
import { useSwitchUserActiveOrg } from "@/features/user/hooks/use-user-info"
import { usePathname } from "next/navigation"

interface Props {
    onOpenDialog : () => void
}

export const OrgSwitcher = ({onOpenDialog} : Props) => {
    const { isMobile } = useSidebar()
    const pathname = usePathname()
    const {
        data: organizations = [],
        isFetching,
        isLoading,
        isError,
        error,
        refetch,
    } = useSuspenseOrganizationMembers();
    const { mutate: onSwitchOrg, isPending } = useSwitchUserActiveOrg();
    const [open, setOpen] = useState(false)
    const [activeId, setActiveId] = useState<number | null>(null)
    const isBusy = isFetching || isPending

    const slugFromPath = useMemo(() => {
        const match = pathname.match(/\/organizations\/([^/?]+)/)
        return match?.[1]
    }, [pathname])

    useEffect(() => {
        if (organizations.length === 0) return

        const matchedOrg = slugFromPath
            ? organizations.find((org) => org.slug === slugFromPath)
            : null

        if (matchedOrg && matchedOrg.id !== activeId) {
            setActiveId(matchedOrg.id)
            return
        }

        if (activeId === null || !organizations.some((org) => org.id === activeId)) {
            setActiveId(organizations[0].id)
        }
    }, [organizations, activeId, slugFromPath])

    const activeOrg = organizations.find((org) => org.id === activeId)

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" disabled className="gap-2">
                        <Spinner className="size-4" />
                        <span className="text-sm">Loading organizations…</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    if (isError) {
        const isUnauthorized = (error as { data?: { code?: string } } | null)?.data?.code === "UNAUTHORIZED"
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className="gap-2 text-destructive"
                        disabled={isUnauthorized}
                        onClick={() => refetch()}
                    >
                        <GalleryVerticalEndIcon className="size-4" />
                        <span className="text-sm">
                            {isUnauthorized ? "Please sign in" : "Failed to load organizations"}
                        </span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    if (!activeOrg) return null

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu
                    open={isBusy ? false : open}
                    onOpenChange={(next) => {
                        if (!isBusy) setOpen(next)
                    }}
                >
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            disabled={isBusy}
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                {isBusy ? (
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
                        {organizations.map((org) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => {
                                    if (isPending || org.id === activeId) return
                                    onSwitchOrg(
                                        { orgId: org.id },
                                        { onSuccess: () => setActiveId(org.id) },
                                    )
                                }}
                                className="gap-2 p-2"
                                disabled={isPending}
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    {isPending && org.id === activeId ? (
                                        <Spinner className="size-3.5" />
                                    ) : (
                                        <GalleryVerticalEndIcon className="size-3.5 shrink-0" />
                                    )}
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
                        <DropdownMenuItem className="gap-2 p-2" onClick={onOpenDialog}>
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
