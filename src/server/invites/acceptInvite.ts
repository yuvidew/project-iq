import { InvitationStatus, PrismaClient } from "@/generated/prisma";
import { normalizeEmail } from "@/server/helpers/updateProjectStatus";

type AcceptInviteByTokenTxType = {
    db: PrismaClient;
    token: string;
    userId: string;
    userEmail: string;
};

export const acceptInviteByTokenTx = async (opts: AcceptInviteByTokenTxType) => {
    const token = opts.token.trim();
    const emailLower = normalizeEmail(opts.userEmail);

    return opts.db.$transaction(async (tx) => {
        const invite = await tx.invitation.findUnique({
            where: { token },
            include: { organization: true },
        });

        if (!invite) {
            return { ok: false as const, reason: "NOT_FOUND" as const };
        }

        if (invite.status !== InvitationStatus.PENDING) {
            return { ok: false as const, reason: "INVALID_STATUS" as const };
        }

        if (invite.expiresAt.getTime() < Date.now()) {
            await tx.invitation.update({
                where: { id: invite.id },
                data: { status: InvitationStatus.EXPIRED },
            });

            return { ok: false as const, reason: "EXPIRED" as const };
        }

        if (normalizeEmail(invite.email) !== emailLower) {
            return { ok: false as const, reason: "EMAIL_MISMATCH" as const };
        }

        await tx.organizationMember.upsert({
            where: {
                userId_organizationSlug: {
                    userId: opts.userId,
                    organizationSlug: invite.organizationSlug,
                },
            },
            update: {
                role: invite.role,
            },
            create: {
                userId: opts.userId,
                organizationSlug: invite.organizationSlug,
                role: invite.role,
            },
        });

        if (invite.organization?.id) {
            await tx.user.update({
                where: { id: opts.userId },
                data: { lastActiveOrganizationId: invite.organization.id },
            });
        }

        await tx.invitation.update({
            where: { id: invite.id },
            data: {
                status: InvitationStatus.ACCEPTED,
                acceptedAt: new Date(),
                invitedUserId: opts.userId,
            },
        });

        return {
            ok: true as const,
            inviteId: invite.id,
            organizationSlug: invite.organizationSlug,
            organizationName: invite.organization?.name ?? null,
            role: invite.role,
        };
    });
};

type acceptAllPendingInvitesByEmailTxType = {
    db: PrismaClient;
    userId: string;
    userEmail: string;
};

export const acceptAllPendingInvitesByEmailTx = async (
    opts: acceptAllPendingInvitesByEmailTxType
) => {
    const emailLower = normalizeEmail(opts.userEmail);

    return opts.db.$transaction(async (tx) => {
        const pendingInvites = await tx.invitation.findMany({
            where: {
                email: emailLower,
                status: InvitationStatus.PENDING,
                expiresAt: { gt: new Date() },
            },
            include: { organization: true },
        });

        const acceptedOrganizationSlugs: string[] = [];
        let lastOrganizationId: number | null = null;

        for (const invite of pendingInvites) {
            await tx.organizationMember.upsert({
                where: {
                    userId_organizationSlug: {
                        userId: opts.userId,
                        organizationSlug: invite.organizationSlug,
                    },
                },
                update: { role: invite.role },
                create: {
                    userId: opts.userId,
                    organizationSlug: invite.organizationSlug,
                    role: invite.role,
                },
            });

            await tx.invitation.update({
                where: { id: invite.id },
                data: {
                    status: InvitationStatus.ACCEPTED,
                    acceptedAt: new Date(),
                    invitedUserId: opts.userId,
                },
            });

            acceptedOrganizationSlugs.push(invite.organizationSlug);
            if (invite.organization?.id) {
                lastOrganizationId = invite.organization.id;
            }
        }

        if (lastOrganizationId) {
            await tx.user.update({
                where: { id: opts.userId },
                data: { lastActiveOrganizationId: lastOrganizationId },
            });
        }

        return {
            acceptedCount: pendingInvites.length,
            acceptedOrganizationSlugs,
        };
    });
};
