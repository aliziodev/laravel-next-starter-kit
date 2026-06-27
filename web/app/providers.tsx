"use client";

import { ThemeProvider } from "next-themes";
import { SanctumProvider } from "next-sanctum";
import type { SanctumUser } from "next-sanctum";
import { sanctumConfig } from "@/lib/sanctum";
import { Toaster } from "@/components/ui/sonner";

/** Providers every page needs (theme + toasts) — mounted in the root layout. */
export function GlobalProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster />
        </ThemeProvider>
    );
}

/**
 * Sanctum auth context — only mounted in route groups that need the
 * authenticated user, so public pages (e.g. the welcome page) don't pay for it.
 */
export function SanctumProviders({
    children,
    initialUser,
}: {
    children: React.ReactNode;
    initialUser: SanctumUser | null;
}) {
    return (
        <SanctumProvider config={sanctumConfig} initialUser={initialUser}>
            {children}
        </SanctumProvider>
    );
}
