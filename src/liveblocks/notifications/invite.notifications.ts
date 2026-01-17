import prisma from "@/lib/db";
import { liveblocks } from "@/server/liveblocks";
import { NotificationType } from "@/generated/prisma";


type InviteSentPayload = {
    email: string;
    organizationName: string;
    organizationSlug: string;
    role: string;
    invitedByName: string;
    token: string;
};

export const notifyInviteSent = async (payload: InviteSentPayload) => {
    const roomIds = new Set<string>();

    roomIds.add(`notifications:invite:${payload.email}`);

    const user = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { id: true },
    });

    if (user) {
        roomIds.add(`notifications:user:${user.id}`);
    }

    const roomIdsToCreate = Array.from(roomIds);

    await Promise.all(
        roomIdsToCreate.map((roomId) =>
            liveblocks.getOrCreateRoom(roomId, { defaultAccesses: [] })
        )
    );

    if (user) {
        const message = `You were invited to join ${payload.organizationName}`;
        const details = `${payload.invitedByName} invited ${payload.email} as ${payload.role}`;

        await prisma.notification.create({
            data: {
                userId: user.id,
                type: NotificationType.INVITATION,
                data: {
                    message,
                    details,
                    invitedByName: payload.invitedByName,
                    invitedEmail: payload.email,
                    role: payload.role,
                    organizationName: payload.organizationName,
                    organizationSlug: payload.organizationSlug,
                    token: payload.token,
                },
            },
        });
    }

    for (const roomId of roomIdsToCreate) {
        await liveblocks.broadcastEvent(roomId, {
            type: "INVITE_SENT",
            payload: {
                organizationName: payload.organizationName,
                organizationSlug: payload.organizationSlug,
                role: payload.role,
                invitedByName: payload.invitedByName,
                invitedEmail: payload.email,
                token: payload.token,
            },
        });
    }
};
