import { COLLECTION_ID_ORGANIZATIONS, DATABASE_ID } from "@/lib/config";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { get } from "http";
import { ID, Query } from "node-appwrite";
import z from "zod";

export const organizationRouter = router({
    createOrganization: protectedProcedure.input(
        z.object({
            name: z.string().min(2).max(100),
            description: z.string().max(500).optional(),
            slug: z.string().min(2).max(50),
            logoUrl: z.string().url().optional(),
        })
    ).mutation(async ({ input, ctx }) => {
        const { name, description, slug, logoUrl } = input;
        const { user, db } = ctx;

        if (!user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "User is not authenticated",
            });
        }

        const existingOrg = await db.listDocuments(DATABASE_ID, COLLECTION_ID_ORGANIZATIONS, [
            Query.equal("slug", slug),
        ]);

        if (existingOrg.total > 0) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "Organization with this slug already exists",
            });
        }

        const organization = await db.createDocument(
            DATABASE_ID,
            COLLECTION_ID_ORGANIZATIONS,
            ID.unique(),
            {
                data: {
                    name,
                    description,
                    slug,
                    logoUrl,
                    ownerId: user.$id,
                },
            });

        return organization;
    }),
    getOrganizations: protectedProcedure.query(async ({ ctx }) => {
        const { user, db } = ctx;
        // TODO: Add pagination and search support

        if (!user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "User is not authenticated",
            });
        }

        const organizations = await db.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_ORGANIZATIONS,
            [
                Query.equal("ownerId", user.$id),
            ]
        );

        return organizations;
    }),
    getOrganizationById: protectedProcedure.input(
        z.string()
    ).query(async ({ input, ctx }) => {
        const { user, db } = ctx;
        const organizationId = input;
        if (!user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "User is not authenticated",
            });
        }
        const organization = await db.getDocument(
            DATABASE_ID,
            COLLECTION_ID_ORGANIZATIONS,
            organizationId
        );

        if (organization.ownerId !== user.$id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You do not have permission to access this organization",
            });
        };
        return organization;
    }),
    updateOrganization: protectedProcedure.input(
        z.object({
            organizationId: z.string(),
            name: z.string().min(2).max(100).optional(),
            description: z.string().max(500).optional(),
            logoUrl: z.string().url().optional(),
        })
    ).mutation(async ({ input, ctx }) => {
        const { organizationId, name, description, logoUrl } = input;
        const { user, db } = ctx;

        if (!user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "User is not authenticated",
            });
        }

        const organization = await db.getDocument(
            DATABASE_ID,
            COLLECTION_ID_ORGANIZATIONS,
            organizationId
        );

        if (organization.ownerId !== user.$id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You do not have permission to update this organization",
            });
        };

        const updatedData: Record<string, any> = {};

        if (name) updatedData.name = name;
        if (description) updatedData.description = description;
        if (logoUrl) updatedData.logoUrl = logoUrl;


        const updatedOrganization = await db.updateDocument(
            DATABASE_ID,
            COLLECTION_ID_ORGANIZATIONS,
            organizationId,
            { data: updatedData }
        );
        return updatedOrganization;
    }),

    deleteOrganization: protectedProcedure.input(
        z.object({
            organizationId: z.string(),
        })
    ).mutation(async ({ input, ctx }) => {
        const { organizationId } = input;
        const { user, db } = ctx;


        if (!user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "User is not authenticated",
            });
        };


        const organization = await db.getDocument(
            DATABASE_ID,
            COLLECTION_ID_ORGANIZATIONS,
            organizationId
        );


        if (organization.ownerId !== user.$id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You do not have permission to delete this organization",
            });
        };


        await db.deleteDocument(
            DATABASE_ID,
            COLLECTION_ID_ORGANIZATIONS,
            organizationId
        );


        return { success: true };
    }),
});