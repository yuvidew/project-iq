import React from 'react'


export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    // await requireAuth();

    return (
      <main>
        {children}
      </main>
    )
}
