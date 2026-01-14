import { Liveblocks } from "@liveblocks/node";

export const liveblocks = new Liveblocks({
    secret: process.env.NEXT_LIVEBLOCKS_SECRET_KEY!,
});

// helper broadcast to a "user room"
export function userRoomId(userId: string) {
    return `user:${userId}`;
}

// helper broadcast to a "team room" (optional)
export function teamRoomId(teamId: string) {
    return `team:${teamId}`;
}
