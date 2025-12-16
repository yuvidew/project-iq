import { redirect } from "next/navigation";
import { createSessionClient } from "@/server/appwriter";

export const requireAuth = async () => {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        return user;
    } catch {
        redirect("/sign-in");
    }
};

export const requireUnAuth = async () => {
    try {
        const { account } = await createSessionClient();
        await account.get();

        redirect("/dashboard");
    } catch {
        return;
    }
};
