// lib/require-auth.ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import prisma from "./db";
import { resolveUserOrganizationRedirect } from "./org-redirect";

// Guard that simply ensures a session exists and returns it.
export const requireAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect(`/sign-in`);
    }

    return session;
};

export const requireInviteAuth = async (token? : string, organization?: string) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect(`/sign-in?token=${token}&organization=${organization}`);
    }

    return session;
}

// Guard that ensures a session, loads org preferences, and redirects
// only when we have a specific org to send the user to.
export const requireAuthAndResolveOrg = async () => {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            lastActiveOrganizationId: true, 
        },
    });

    if (!user) {
        redirect("/sign-in");
    }

    const url = await resolveUserOrganizationRedirect(user);

    // Avoid redirect loops; if we're already on the organizations listing,
    // let the page render instead of redirecting back to the same path.
    if (url !== "/organizations") {
        redirect(url);
    }

    return session;
};

export const requireUnAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/");
    }
};
