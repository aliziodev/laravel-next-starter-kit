import { getUser } from "@/lib/auth";
import { SanctumProviders } from "../providers";

/**
 * Auth-flow pages (login, register, password reset, email verification, 2FA
 * challenge, …). They need the Sanctum context but not an auth guard — each page
 * handles its own guest/flow redirect. `getUser` seeds the provider and is
 * request-cached, so it doesn't double-fetch with a page that also reads it.
 */
export default async function AuthGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const initialUser = await getUser();

    return (
        <SanctumProviders initialUser={initialUser}>
            {children}
        </SanctumProviders>
    );
}
