// import { TeamRole } from "@/generated/prisma";
import prisma from "@/lib/db";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import nodemailer from "nodemailer";
import { OrganizationRole, Prisma, ProjectStatus } from "@/generated/prisma";
import { randomUUID } from "crypto";
import { PAGINATION } from "@/lib/config";
import { notifyInviteSent } from "@/liveblocks/notifications/invite.notifications";








export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// const assertTeamAdmin = async (userId: string, teamId: string) => {
//     const member = await prisma.teamMember.findUnique({
//         where: {
//             teamId_userId: {
//                 teamId,
//                 userId,
//             },
//         },
//     });

//     if (!member || member.role !== "ADMIN") {
//         throw new TRPCError({
//             code: "FORBIDDEN",
//             message: "You are not allowed to invite members.",
//         });
//     }
// };

export const teamsRouter = router({
    invite: protectedProcedure
        .input(
            z.object({
                email: z.string(),
                slug: z.string(),
                role: z.enum(OrganizationRole),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { email, slug, role } = input;

            const organization = await prisma.organization.findUnique({
                where: { slug },
            });

            if (!organization) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Organization not found",
                });
            }

            const normalizedEmail = normalizeEmail(email);

            if (normalizedEmail === ctx.auth.user.email) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You cannot invite yourself.",
                });
            }

            const invited = await prisma.invitation.upsert({
                where: {
                    email_organizationSlug: {
                        email: normalizedEmail,
                        organizationSlug: slug,
                    },
                },
                create: {
                    email: normalizedEmail,
                    role,
                    organizationSlug: slug,
                    invitedById: ctx.auth.user.id,
                    token: randomUUID(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                update: {
                    role,
                    invitedById: ctx.auth.user.id,
                    token: randomUUID(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });

            await transporter.sendMail({
                from: process.env.SMTP_FROM_EMAIL,
                to: normalizeEmail(email),
                subject: "You've been invited to join an organization",
                html: `
                    <p>You've been invited to join the organization <strong>${organization.name}</strong>.</p>
                    <p>Click the link below to accept the invitation:</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/invite/${invited.token}">Accept Invitation</a>
                `,
            });


            await notifyInviteSent({
                email: normalizedEmail,
                organizationName: organization.name,
                organizationSlug: slug,
                role,
                invitedByName: ctx.auth.user.name ?? "Someone",
                token: invited.token,
            });


            return invited;
        }),

    getMany: protectedProcedure
        .input(z.object({
            organizationSlug: z.string(),
            page: z.number().default(PAGINATION.DEFAULT_PAGE),
            pageSize: z
                .number()
                .min(PAGINATION.MIN_PAGE_SIZE)
                .max(PAGINATION.MAX_PAGE_SIZE)
                .default(PAGINATION.DEFAULT_PAGE_SIZE),
            search: z.string().default(""),
        }))
        .query(async ({ input }) => {
            const { page, pageSize, search, organizationSlug } = input;

            const skip = (page - 1) * pageSize;

            const searchTerm = search.trim();

            const where: Prisma.OrganizationMemberWhereInput = {
                organizationSlug,
                ...(searchTerm && {
                    OR: [
                        { user: { name: { contains: searchTerm, mode: "insensitive" as const } } },
                        { user: { email: { contains: searchTerm, mode: "insensitive" as const } } },
                    ],
                }),
            };


            const [total, memberships] = await Promise.all([
                prisma.organizationMember.count({ where }),
                prisma.organizationMember.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: pageSize,
                    include: {
                        user: true,

                    },
                }),
            ]);

            return {
                memberships,
                meta: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                }
            };
        }
        ),

    getOrgDetails: protectedProcedure
        .input(
            z.object({
                organizationSlug: z.string(),
            })
        ).query(async ({ input, ctx }) => {
            const { organizationSlug } = input;

            const organization = await prisma.organization.findUnique({
                where: { slug: organizationSlug },
                include: {
                    members: {
                        select: {
                            user: {
                                select: { email: true, name: true },
                            },
                        },
                    },
                },
            });

            if (!organization) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Organization not found",
                });
            }

            const [totalMembers, activeProjects, myTasks] = await Promise.all([
                prisma.organizationMember.count({
                    where: { organizationSlug },
                }),
                prisma.project.count({
                    where: {
                        organizationSlug,
                        status: { not: ProjectStatus.COMPLETED },
                    },
                }),
                prisma.task.count({
                    where: {
                        assigneeId: ctx.auth.user.id,
                        project: { organizationSlug },
                    },
                }),
            ]);

            return {
                organization,
                stats: {
                    totalMembers,
                    activeProjects,
                    myTasks,
                },
            };
        }),

    remove: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                organizationSlug: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { userId, organizationSlug } = input;
            const membership = await prisma.organizationMember.deleteMany({
                where: {
                    userId,
                    organizationSlug,
                },
            });
            return membership;
        }
        ),
});
