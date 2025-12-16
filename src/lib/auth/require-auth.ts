import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/server/appwriter";

import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/features/auth/constants";

export const requireAuth = async () => {
  const cookie = (await cookies()).get(AUTH_COOKIE);
  console.log("AUTH_COOKIE =", AUTH_COOKIE);
  console.log("cookie value exists? =", !!cookie?.value);

  const sdk = await createSessionClient({ optional: true });
  console.log("sdk is", sdk);

//   if (!sdk) redirect("/sign-in");

//   try {
//     const user = await sdk.account.get();
//     console.log("user =", user.$id);
//     return user;
//   } catch (e) {
//     console.log("account.get failed:", e);
//     redirect("/sign-in");
//   }
};




export const requireUnAuth = async () => {
    const client = await createSessionClient({ optional: true });

    // no session cookie -> not logged in -> allow auth pages
    if (!client) return;

    try {
        await client.account.get();

        console.log("the client", client.account.get());
        redirect("/organization");
    } catch {
        return; // session invalid -> allow auth pages
    }
};

