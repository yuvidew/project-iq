import { PrismaClient, InviteStatus } from "@/generated/prisma";

type AcceptInviteByTokenTxType = {
    db: PrismaClient;
    token: string;
    userId: string;
    userEmail: string;
}

export const acceptInviteByTokenTx = async (opts: AcceptInviteByTokenTxType) => {
    const token = opts.token.trim();
    const emailLower = opts.userEmail.trim().toLowerCase();

    return opts.db.$transaction(async (tx) => {
        const invite = await tx.teamInvite.findUnique({
            where: { token },
            include: { team: true },
        });

        if (!invite) {
            return { ok: false as const, reason: "NOT_FOUND" as const };
        };

        if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
            await tx.teamInvite.update({
                where: { id: invite.id },
                data: { status: InviteStatus.EXPIRED },
            });

            return { ok: false as const, reason: "EXPIRED" as const };
        };

        await tx.teamMember.upsert({
            where: { teamId_userId: { teamId: invite.teamId, userId: opts.userId } },
            update: {
                role: invite.role,
            },
            create: {
                teamId: invite.teamId,
                userId: opts.userId,
                role: invite.role,
            },
        });

        // mark invite accepted
        await tx.teamInvite.update({
            where: { id: invite.id },
            data: {
                status: InviteStatus.ACCEPTED,
                acceptedAt: new Date(),
                declinedAt: null,
            },
        });

        return {
            ok: true as const,
            inviteId: invite.id,
            teamId: invite.teamId,
            teamName: invite.team.name,
            role: invite.role,
        };
    })
};

type acceptAllPendingInvitesByEmailTxType = {
    db: PrismaClient;
    userId: string;
    userEmail: string;
}

export const acceptAllPendingInvitesByEmailTx = async (opts: acceptAllPendingInvitesByEmailTxType) => {
    const emailLower = opts.userEmail.trim().toLowerCase();

    return opts.db.$transaction(async (tx) => {
        const invites = await tx.team.findMany({
            where: {
                email: emailLower,
                status: "PENDING",
                expiresAt: { gt: new Date() },
            },
            select: { id: true, token: true, teamId: true, role: true },
        });

        const acceptedTeamIds: string[] = [];

        for (const inv of invites) {
            await tx.taskMember.upsert({
                where: { teamId_userId: { teamId: inv.teamId, userId: opts.userId } },
                update: { role: inv.role },
                create: { teamId: inv.teamId, userId: opts.userId, role: inv.role },

            });

            await tx.teamInvite.update({
                where: { id: inv.id },
                data: { status: "ACCEPTED", acceptedAt: new Date(), declinedAt: null },
            });

            acceptedTeamIds.push(inv.teamId);
        }

        return { acceptedCount: invites.length, acceptedTeamIds };


    })

}