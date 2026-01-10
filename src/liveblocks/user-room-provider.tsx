import { RoomProvider } from "@liveblocks/react";

export function UserRoomProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  return (
    <RoomProvider id={`user:${userId}`} initialPresence={{}}>
      {children}
    </RoomProvider>
  );
}
