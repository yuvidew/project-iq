import React from 'react'

import { requireAuth } from "@/lib/auth/require-auth";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // await requireAuth();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className=' bg-accent/20'>
                {/* start to header */}
                <AppHeader/>
                {/* end to header */}

                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
