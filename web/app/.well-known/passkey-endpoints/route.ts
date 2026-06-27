import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Passkey enroll/manage discovery endpoint.
 *
 * Password managers and browsers fetch `/.well-known/passkey-endpoints` from the
 * relying-party origin to deep-link users to where they can add or manage their
 * passkeys (see https://passkeys.dev/docs/advanced/related-origins/#relying-party-changes). In this
 * decoupled stack the relying party and the management UI both live on the
 * Next.js frontend, so this is served here and points at our settings page.
 */
export function GET(request: NextRequest) {
    const securityUrl = new URL(
        "/settings/security",
        request.nextUrl.origin,
    ).toString();

    return NextResponse.json({
        enroll: securityUrl,
        manage: securityUrl,
    });
}
