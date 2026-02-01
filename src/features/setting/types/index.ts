import { OrganizationRole } from "@/generated/prisma";

export type  organizationMembers = {
    user: {
        image: string | null;
        email: string;
        id: string;
        name: string | null;
    };
    id: number;
    role: OrganizationRole;
}