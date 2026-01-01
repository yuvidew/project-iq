import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/trpc-client-provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ProjectIQ",
    template: "%s | ProjectIQ",
  },
  description:
    "ProjectIQ is a smart project and task management platform that helps teams collaborate, manage organizations, track work, and boost productivity with AI-powered insights.",
  keywords: [
    "ProjectIQ",
    "project management",
    "task management",
    "jira alternative",
    "team collaboration",
    "organization management",
    "AI productivity",
    "Next.js SaaS",
  ],
  authors: [{ name: "ProjectIQ Team" }],
  creator: "ProjectIQ",
  openGraph: {
    title: "ProjectIQ — Smarter Project Management",
    description:
      "Manage organizations, projects, and tasks efficiently with ProjectIQ. A modern Jira-like platform enhanced with AI.",
    siteName: "ProjectIQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProjectIQ — Smarter Project Management",
    description:
      "A modern project management platform for teams and organizations, powered by AI.",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const incomingHeaders = await headers();
  const trpcHeaders = Object.fromEntries(incomingHeaders.entries());

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <TRPCReactProvider headers={trpcHeaders}>
              {children}
              <Toaster />
            </TRPCReactProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
