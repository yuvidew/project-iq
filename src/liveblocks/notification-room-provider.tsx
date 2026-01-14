"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";

export function NotificationRoomProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={`notifications:user:${userId}`}>
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}
