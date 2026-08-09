import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/mail";

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      const displayName = user.name || user.email;
      const safeDisplayName = escapeHtml(displayName);
      const safeUrl = escapeHtml(url);

      await sendEmail({
        to: user.email,
        subject: "Reset your Project.IQ password",
        text: [
          `Hi ${displayName},`,
          "",
          "We received a request to reset your Project.IQ password.",
          "Use the link below to choose a new password. This link expires in 1 hour.",
          "",
          url,
          "",
          "If you did not request this, you can ignore this email.",
        ].join("\n"),
        html: `
          <p>Hi ${safeDisplayName},</p>
          <p>We received a request to reset your Project.IQ password.</p>
          <p>Use the link below to choose a new password. This link expires in 1 hour.</p>
          <p><a href="${safeUrl}">Reset password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    },
  },
});
