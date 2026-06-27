import { createSanctumRouteProxy } from "next-sanctum/server";

/**
 * Same-origin proxy to the Laravel API. The browser calls `/api/sanctum/*` on
 * the Next origin and this handler forwards to `SANCTUM_BASE_URL` — `upstream`
 * is pinned (anti-SSRF) and Origin/Referer are forwarded so Sanctum recognises
 * the SPA as stateful (cookie/session auth).
 */
const handler = createSanctumRouteProxy({
    upstream: process.env.SANCTUM_BASE_URL!,
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
