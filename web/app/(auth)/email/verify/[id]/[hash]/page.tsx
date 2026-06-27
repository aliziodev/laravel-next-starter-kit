"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SanctumError, useAuth, useUser } from "next-sanctum";
import AuthLayout from "@/layouts/auth-layout";
import TextLink from "@/components/text-link";
import { Spinner } from "@/components/ui/spinner";

function VerifyEmailCallback() {
    const router = useRouter();
    const params = useParams<{ id: string; hash: string }>();
    const search = useSearchParams();
    const { verifyEmail } = useAuth();
    const user = useUser<{ email_verified_at: string | null }>();
    const [error, setError] = useState<string | null>(null);
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;

        // Already verified (e.g. re-clicking the link) → straight to the dashboard,
        // no need to hit the API again.
        if (user?.email_verified_at) {
            ran.current = true;
            router.replace("/dashboard");
            return;
        }

        ran.current = true;

        (async () => {
            try {
                // next-sanctum replays the signed link to the API (through the proxy)
                // and refreshes the user. The signature stays valid because the path +
                // query match the signed API route.
                await verifyEmail({
                    id: params.id,
                    hash: params.hash,
                    expires: search.get("expires") ?? "",
                    signature: search.get("signature") ?? "",
                });
                router.replace("/dashboard");
                router.refresh();
            } catch (err) {
                // Verifying requires being logged in as this user (Laravel default) —
                // bounce to login, then back here to finish verifying.
                if (
                    err instanceof SanctumError &&
                    err.kind === "unauthorized"
                ) {
                    const back =
                        window.location.pathname + window.location.search;
                    router.replace(
                        `/login?redirect=${encodeURIComponent(back)}`,
                    );
                    return;
                }
                setError("This verification link is invalid or has expired.");
            }
        })();
    }, [user, params.id, params.hash, search, verifyEmail, router]);

    return (
        <AuthLayout
            title="Verifying your email"
            description="Please wait while we confirm your email address."
        >
            {error ? (
                <div className="space-y-4 text-center text-sm">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <TextLink href="/verify-email">
                        Request a new verification link
                    </TextLink>
                </div>
            ) : (
                <div className="flex justify-center py-6">
                    <Spinner />
                </div>
            )}
        </AuthLayout>
    );
}

export default function VerifyEmailHandlerPage() {
    return (
        <Suspense fallback={null}>
            <VerifyEmailCallback />
        </Suspense>
    );
}
