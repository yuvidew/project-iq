
import prisma from "./db";

export async function resolveUserOrganizationRedirect(user: {
    id: string;
    lastActiveOrganizationId: number | null;
}) {
    
    const memberships = await prisma.organizationMember.findMany({
        where: { userId: user.id },
        include: { organization: true },
    });

    if (user.lastActiveOrganizationId !== null) {
        const lastOrg = memberships.find((m) => m.organization.id === user.lastActiveOrganizationId);

        if (lastOrg) {
            return `/organizations/${lastOrg.organization.slug}`;
            // return "/organizations";
        }
    }

    if (memberships.length === 0) return "/organizations";
    if (memberships.length === 1) {
        return `/organizations/${memberships[0].organization.slug}`;
        // return "/organizations";
    }

    return "/organizations";
}
