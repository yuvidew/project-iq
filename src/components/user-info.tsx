"use client"

import { useState } from "react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { useUserDetails } from "@/features/user/hooks/use-user-info"
import { Spinner } from "@/components/ui/spinner"
import { BellDotIcon, CircleUserRoundIcon, CreditCardIcon, LogOutIcon } from "lucide-react"

export const UserInfo = () => {
    const { isMobile } = useSidebar()
    const { data, isFetching } = useUserDetails()
    const [open, setOpen] = useState(false)

    const displayName = data?.name ?? "User"
    const displayEmail = data?.email ?? ""
    const avatarSrc = data?.image ?? undefined
    const initials = (displayName || displayEmail || "U")
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    return (
        <DropdownMenu
            open={isFetching ? false : open}
            onOpenChange={(next) => {
                if (!isFetching) setOpen(next)
            }}
        >
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="cursor-pointer"
                    disabled={isFetching}
                    aria-busy={isFetching}
                >
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                        {isFetching ? (
                            <div className="flex h-full w-full items-center justify-center">
                                <Spinner className="h-4 w-4" />
                            </div>
                        ) : (
                            <>
                            <AvatarImage src={avatarSrc} alt={displayName} />
                            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                            </>
                        )}
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={avatarSrc} alt={displayName} />
                            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{displayName}</span>
                            <span className="text-muted-foreground truncate text-xs">
                                {displayEmail}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <CircleUserRoundIcon />
                        Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CreditCardIcon />
                        Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <BellDotIcon />
                        Notifications
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LogOutIcon />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
