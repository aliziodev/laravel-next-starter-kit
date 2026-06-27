import AuthLayoutTemplate from "@/layouts/auth/auth-simple-layout";
import type { ReactNode } from "react";

export default function AuthLayout({
    title = "",
    description = "",
    children,
}: {
    title?: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description}>
            {children}
        </AuthLayoutTemplate>
    );
}
