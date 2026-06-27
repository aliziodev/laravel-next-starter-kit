import type { SanctumConfig } from "next-sanctum";

/**
 * Shared next-sanctum config (the base URL lives in env; everything else here).
 * Imported by the client provider. Cookie/SPA mode talks to Laravel Fortify +
 * Sanctum through the same-origin proxy.
 */
export const sanctumConfig = {
    baseUrl: process.env.NEXT_PUBLIC_SANCTUM_BASE_URL!,
    mode: "cookie",
    features: {
        // Passwordless sign-in via WebAuthn. Opt-in (off by default) because it needs
        // the optional laravel/passkeys backend package + @laravel/passkeys on the client.
        passkeys: true,
    },
    redirect: {
        onLogin: "/dashboard",
        onLogout: "/login",
    },
    // When a request 401s while we believed the user was authenticated (session
    // expired, or the user was deleted), clear state and hard-redirect to login
    // instead of leaving a broken/stale UI (e.g. a vanished user menu).
    redirectIfUnauthenticated: "/login",
} satisfies SanctumConfig;
