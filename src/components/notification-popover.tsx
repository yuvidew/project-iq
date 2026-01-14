"use client"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { LiveblocksEvent, Notification } from "@/liveblocks/types"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { BellIcon } from "lucide-react"
import { Badge } from "./ui/badge"
import { useEventListener } from "@liveblocks/react"

export const NotificationPopover = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = notifications.filter((n) => !n.read).length;


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
                                notification.data.message ??
                                `You were invited to join ${notification.data.organizationName ?? "an organization"}`,
                            details: notification.data.details,
                            createdAt: new Date(notification.createdAt),
                            read: notification.read,
                        }))
                        .filter((item) => !existingIds.has(item.id));

                    return [...historyItems, ...prev];
                });
            } catch (error) {
                console.error("Unable to load notification history", error);
            }
        };

        loadNotifications();

        return () => {
            active = false;
        };
    }, []);

    useEventListener(({ event }) => {
        if (!event) return;

        const e = event as LiveblocksEvent;

        let message: string | null = null;
        let details: string | undefined;

        switch (e.type) {
            case "INVITE_SENT":
                message = `You were invited to join ${e.payload.organizationName}`;
                details = `${e.payload.invitedByName} invited ${e.payload.invitedEmail} as ${e.payload.role}`;
                break;

            case "INVITE_ACCEPTED":
                message = `${e.payload.joinedUserName} joined ${e.payload.organizationName}`;
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
            },
            ...prev,
        ]);
    });

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
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
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`px-4 py-3 text-sm border-b last:border-b-0 ${!n.read ? "bg-muted/50" : ""}`}
                            >
                                <p>{n.message}</p>
                                <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-0.5">
                                    <span>{n.createdAt.toLocaleTimeString()}</span>
                                    {n.details && (
                                        <span className="text-[11px] truncate">{n.details}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
