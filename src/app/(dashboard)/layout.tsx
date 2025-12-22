import React from 'react'
import { requireAuth } from "@/lib/auth-utils";


export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    await requireAuth();

    return (
      <main>
        {children}
      </main>
    )
}
