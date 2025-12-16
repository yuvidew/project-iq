import React from 'react'

import { requireAuth } from "@/lib/auth/require-auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    await requireAuth();

    return (
        <div>{children}</div>
    )
}
