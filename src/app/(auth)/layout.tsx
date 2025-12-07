import React, { ReactNode } from 'react';

export default function AuthLayout({children} : {children: ReactNode}) {
    return (
        <main className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                {children}
            </div>
        </main>
    )
}
