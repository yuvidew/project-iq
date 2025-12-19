"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SettingsIcon, UsersIcon, LogOutIcon, MoonIcon, SunIcon, FolderOpenIcon, LayersIcon, LayoutGridIcon } from "lucide-react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
// import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";
// import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscriptions"
import { useTheme } from "next-themes";

const menu_Items = [
    {
        title: "Main",
        items: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: LayoutGridIcon
            },
            {
                title: "Projects",
                url: "/projects",
                icon: FolderOpenIcon
            },
            {
                title: "Teams",
                url: "/Teams",
                icon: UsersIcon
            },
            {
                title: "Setting",
                url: "/setting",
                icon: SettingsIcon
            },
        ],
    },
]

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    // const { hasActiveSubscription, isLoading } = useHasActiveSubscription()
    const [isSignOutLoading, setIsSignOutLoading] = useState(false)
    const { setTheme, theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
    }, [])

    const effectiveTheme = resolvedTheme ?? theme ?? "light"
    const themeTooltip = mounted ? (effectiveTheme === "light" ? "Light" : "Dark") : "Theme"
    const themeLabel = mounted ? effectiveTheme : "theme"

    const onSignOut = async () => {
        // setIsSignOutLoading(true)
        // try {

        //     await authClient.signOut({
        //         fetchOptions: {
        //             onSuccess: () => {
        //                 router.replace("/sign-in")
        //             }
        //         }
        //     })
        // } catch {
        //     setIsSignOutLoading(false)
        // } finally {
        //     setIsSignOutLoading(false)
        // }
    }

    return (
        <Sidebar {...props} collapsible="icon" >
            <SidebarHeader>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={"Nodebase"}
                        className="gap-x-4 h-10 px-4 hover:bg-transparent">
                        <Link href={"/"} prefetch>
                            {/* <Button size={"icon"} > */}
                            <LayersIcon className=" text-primary size-7" />
                            {/* </Button> */}
                            <span className='  text-lg font-semibold'>
                                ProjectIQ
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menu_Items.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map(({ title, icon: Icon, url }) => (
                                    <SidebarMenuItem key={title}>
                                        <SidebarMenuButton
                                            isActive={
                                                url === "/"
                                                    ? pathname === "/"
                                                    : pathname.startsWith(url)
                                            }
                                            tooltip={title}
                                            asChild
                                            className="gap-x-4 h-10 px-4"
                                        >
                                            <Link href={url} prefetch>
                                                {Icon && <Icon className="w-4 h-4" />}
                                                {title}
                                            </Link>
                                            {/* </a> */}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                <SidebarGroup>
                    <SidebarGroupLabel>My Tasks 0</SidebarGroupLabel>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>

                <SidebarMenuItem>
                    <SidebarMenuButton
                        tooltip={themeTooltip}
                        className="gap-x-4 h-10 px-4"
                        onClick={() => setTheme(effectiveTheme === "light" ? "dark" : "light")}
                    >
                        <>
                            <SunIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                        </>
                        <span className=" capitalize">{themeLabel}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                    <SidebarMenuButton
                        tooltip={"Sign out"}
                        className="gap-x-4 h-10 px-4"
                        onClick={onSignOut}
                    >
                        {isSignOutLoading ? <Spinner className="text-primary" /> : <LogOutIcon className=" size-4" />}
                        <span>Sign out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarFooter>
        </Sidebar>
    )
}