"use client";
import { useRouter } from "next/navigation";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { LiveblocksEvent, Notification } from "@/liveblocks/types";
import { useEffect, useState, type KeyboardEvent } from "react";
import { Button } from "./ui/button";
import { BellIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { useEventListener } from "@liveblocks/react";
import { toast } from "sonner";

import {
    Item,
    ItemContent,
    ItemFooter,
    ItemHeader,
} from "@/components/ui/item"
import { format } from "date-fns";

export const NotificationPopover = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleNotificationClick = (token?: string, orgName?: string, details?: string) => {
        if (!token) {
            toast.error("Token is required")
            return;
        }

        const params = new URLSearchParams();
        if (orgName) {
            params.set("organization", orgName);
        }
        if (details) {
            params.set("details", details);
        }

        const queryString = params.toString();

        router.push(`/invite/${token}${queryString ? `?${queryString}` : ""}`);
    };

    const handleNotificationKeyDown = (
        event: KeyboardEvent<HTMLDivElement>,
        token?: string,
        orgName?: string,
        details?: string
    ) => {
        if (!token) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleNotificationClick(token, orgName, details);
        }
    };

    useEffect(() => {
        let active = true;
        const loadNotifications = async () => {
            try {
                const response = await fetch("/api/notifications");
                if (!response.ok) {
                    throw new Error("Failed to load notifications");
                }
                const apiData: {
                    id: string;
                    type: "INVITATION";
                    data: {
                        message?: string;
                        details?: string;
                        organizationName?: string;
                        organizationSlug?: string;
                        slug?: string;
                        token?: string;
                    };
                    read: boolean;
                    createdAt: string;
                }[] = await response.json();

                if (!active) return;

                setNotifications((prev) => {
                    const existingIds = new Set(prev.map((item) => item.id));
                    const historyItems = apiData
                        .map((notification) => ({
                            id: notification.id,
                            type: "INVITE_SENT" as const,
                            message:
                                `You were invited to join  "${notification.data.organizationName ?? "an organization"
                                }"`,
                            details: notification.data.details,
                            createdAt: new Date(notification.createdAt),
                            read: notification.read,
                            inviteToken: notification.data.token,
                            orgName: notification.data.organizationName,
                            orgSlug:
                                notification.data.organizationSlug ?? notification.data.slug,
                        }))
                        .filter((item) => !existingIds.has(item.id));

                    return [...historyItems, ...prev];
                });
            } catch (error) {
                toast.error("Unable to load notification history")
                console.error("Unable to load notification history", error);
            }
        };

        loadNotifications();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const handler = (event: Event) => {
            const customEvent = event as CustomEvent<{ token?: string }>;
            const declinedToken = customEvent.detail?.token;
            if (!declinedToken) {
                return;
            }

            setNotifications((prev) =>
                prev.filter((notification) => notification.inviteToken !== declinedToken),
            );
        };

        window.addEventListener("invitationDeclined", handler);

        return () => {
            window.removeEventListener("invitationDeclined", handler);
        };
    }, []);

    useEventListener(({ event }) => {
        if (!event) return;

        const e = event as LiveblocksEvent;

        let message: string | null = null;
        let details: string | undefined;
        let inviteToken: string | undefined;
        let orgSlug: string | undefined;

        switch (e.type) {
            case "INVITE_SENT":
                message = `You were invited to join "${e.payload.organizationName}"`;
                details = `${e.payload.invitedByName} invited ${e.payload.invitedEmail} as ${e.payload.role}`;
                inviteToken = e.payload.token;
                orgSlug = e.payload.organizationSlug;
                break;

            case "INVITE_ACCEPTED":
                message = `${e.payload.joinedUserName} joined "${e.payload.organizationName}"`;
                details = `Organization: ${e.payload.organizationName}`;
                break;

            default:
                return; // ignore unknown events
        }

        setNotifications((prev) => [
            {
                id: crypto.randomUUID(),
                type: e.type,
                message,
                createdAt: new Date(),
                read: false,
                details,
                inviteToken,
                orgSlug,
            },
            ...prev,
        ]);
    });

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={"ghost"} size={"icon-sm"} className=" relative">
                    <BellIcon />

                    {unreadCount > 0 && (
                        <Badge
                            variant="notification"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <p className="font-semibold text-sm">Notifications</p>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-muted-foreground hover:underline"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                            No notifications yet
                        </p>
                    ) : (
                        notifications.map((n) => {
                            const isClickable = Boolean(n.inviteToken);

                            return (
                                <Item
                                    key={n.id}
                                    role={isClickable ? "button" : undefined}
                                    tabIndex={isClickable ? 0 : undefined}
                                    onClick={
                                        isClickable
                                            ? () =>
                                                handleNotificationClick(
                                                    n.inviteToken,
                                                    n.orgName,
                                                    n.details,
                                                )
                                            : undefined
                                    }
                                    onKeyDown={
                                        isClickable
                                            ? (event) =>
                                                handleNotificationKeyDown(
                                                    event,
                                                    n.inviteToken,
                                                    n.orgName,
                                                    n.details,
                                                )
                                            : undefined
                                    }
                                    className={`px-4 py-3 text-sm border-b rounded-none gap-1 last:border-b-0 ${!n.read ? "bg-muted/50" : ""
                                        } ${isClickable
                                            ? "cursor-pointer transition-colors hover:bg-muted/70"
                                            : ""
                                        }`}
                                >
                                    <ItemHeader>{n.message}</ItemHeader>
                                    <ItemContent className="text-xs text-muted-foreground mt-1 flex flex-col gap-0.5">
                                        {n.details && (
                                            <span className="text-[11px] truncate">{n.details}</span>
                                        )}
                                        {n.orgSlug && (
                                            <span className="text-[11px] truncate">Slug: {n.orgSlug}</span>
                                        )}
                                    </ItemContent>
                                    <ItemFooter className="text-xs">
                                        <span>{format(n.createdAt, "MMM dd, yyyy")}</span>
                                    </ItemFooter>
                                </Item>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
