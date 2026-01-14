"use client";

import { useEventListener } from "@liveblocks/react";
import { toast } from "sonner"; // or any toast lib
import { LiveblocksEvent } from "../types";



export function useNotifications() {
    useEventListener(({ event }) => {
        if (!event) return;

        const typedEvent = event as LiveblocksEvent;

        switch (typedEvent.type) {
            case "INVITE_SENT":
                toast.info(
                    `You were invited to join ${typedEvent.payload.organizationName}`
                );
                break;

            case "INVITE_ACCEPTED":
                toast.success(
                    `${typedEvent.payload.joinedUserName} joined ${typedEvent.payload.organizationName}`
                );
                break;
        }
    });
}
