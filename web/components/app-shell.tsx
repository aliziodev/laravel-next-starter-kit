import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

type AppVariant = "header" | "sidebar";

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = "sidebar" }: Props) {
    if (variant === "header") {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider>{children}</SidebarProvider>;
}
