import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "./providers";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
    variable: "--font-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Laravel Next Starter Kit",
    description:
        "Decoupled Next.js frontend for Laravel Fortify + Sanctum, powered by next-sanctum.",
};

// Only truly global providers live here (theme, toasts, tooltips). The Sanctum
// auth provider is scoped to the (app) / (auth) route groups so public pages
// don't load it or fetch the user.
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="flex min-h-full flex-col">
                <GlobalProviders>
                    <TooltipProvider>{children}</TooltipProvider>
                </GlobalProviders>
            </body>
        </html>
    );
}
