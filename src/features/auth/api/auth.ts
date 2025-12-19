import { createAdminClient } from "@/server/appwriter";
import { publicProcedure, router } from "@/server/trpc";
import { deleteCookie, setCookie } from "cookies-next";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AUTH_COOKIE } from "../constants";
import { ID } from "node-appwrite";


export const authRouter = router({
    signUp: publicProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const { name, email, password } = input;
                const { account } = await createAdminClient();
                await account.create(ID.unique(), email, password, name);

                return { success: true };
            } catch (error) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Failed to sign up",
                    cause: error,
                });
            }
        }),
    signIn: publicProcedure
        .input(
            z.object({
                email: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const { email, password } = input;
                const { account } = await createAdminClient();

                const session = await account.createEmailPasswordSession(email, password);

                setCookie(AUTH_COOKIE, session.secret, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                });

                return { success: true };
            } catch (error) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                    cause: error,
                });
            }
        }),
    logout: publicProcedure.mutation(async () => {
        deleteCookie(AUTH_COOKIE, {
            path: "/", // MUST match cookie path
        });

        return { success: true };
    }),
});
