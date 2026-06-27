import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Passkey {
    id: number;
    name: string;
    created_at: string;
    last_used_at: string | null;
}

export interface AuthLayoutProps {
    title?: string;
    description?: string;
    children: ReactNode;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}
