import { createSanctumProxy } from "next-sanctum/proxy";

/**
 * Optimistic route guard (Next.js 16 `proxy.ts`, formerly `middleware.ts`).
 *
 * NOTE: we intentionally do NOT use `guestOnly` here. Laravel issues a
 * `laravel_session` cookie to GUESTS too (for CSRF/session), so the cookie's
 * mere presence does not imply authentication — using it for a guest-only
 * redirect causes a /login ⇄ /dashboard loop. Real authorization is enforced
 * in Server Components via `getUser()` (see app/dashboard/page.tsx), and the
 * auth pages redirect already-authenticated users client-side via `useUser()`.
 */
export default createSanctumProxy({
    authOnly: ["/dashboard/:path*", "/settings/:path*"],
    sessionCookie: "laravel_session",
    redirect: {
        onAuthOnly: "/login",
        keepRequestedRoute: true,
    },
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
