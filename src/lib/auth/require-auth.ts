import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/server/appwriter";

export const requireAuth = async () => {
    const sdk = await createSessionClient({ optional: true });
    if (!sdk) {
        redirect("/sign-in");
    }

    try {
        const user = await sdk.account.get();
        return user;
    } catch {
        redirect("/sign-in");
    }
};

export const requireUnAuth = async () => {
    const client = await createSessionClient({ optional: true });
    if (!client) return;

    try {
        await client.account.get();
        redirect("/organizations");
    } catch {
        return;
    }
};
