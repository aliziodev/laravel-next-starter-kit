import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import AuthLayout from "@/layouts/auth-layout";
import { LoginForm } from "./login-form";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ redirect?: string }>;
}) {
    const sp = await searchParams;
    // Same-origin relative paths only (anti open-redirect).
    const redirectTo =
        typeof sp.redirect === "string" &&
        sp.redirect.startsWith("/") &&
        !sp.redirect.startsWith("//")
            ? sp.redirect
            : "/dashboard";

    // Already authenticated → skip the form. Server-side (getUser) so it uses the
    // same source of truth as the dashboard guard — no client/server redirect loop.
    if (await getUser()) redirect(redirectTo);

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <LoginForm redirectTo={redirectTo} />
        </AuthLayout>
    );
}
