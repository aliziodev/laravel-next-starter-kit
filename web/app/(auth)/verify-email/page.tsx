"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SanctumError, useAuth, useUser } from "next-sanctum";
import { toast } from "sonner";
import AuthLayout from "@/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function VerifyEmail() {
    const { resendEmailVerification, logout } = useAuth();
    const user = useUser<{ email_verified_at: string | null }>();
    const router = useRouter();
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    // Not logged in → login; already verified → dashboard. Only a logged-in,
    // unverified user should see the resend UI.
    useEffect(() => {
        if (!user) {
            router.replace("/login");
        } else if (user.email_verified_at) {
            router.replace("/dashboard");
        }
    }, [user, router]);

    async function handleResend(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setProcessing(true);

        try {
            await resendEmailVerification();
            toast.success("A new verification link has been sent.");
            setStatus("verification-link-sent");
        } catch (error) {
            // Session gone (logged out / expired) → send them to login.
            if (
                error instanceof SanctumError &&
                error.kind === "unauthorized"
            ) {
                router.replace("/login");
            }
        } finally {
            setProcessing(false);
        }
    }

    async function handleLogout() {
        await logout();
        router.push("/login");
        router.refresh();
    }

    return (
        <AuthLayout
            title="Email verification"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            {status === "verification-link-sent" && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={handleResend} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <Spinner />}
                    Resend verification email
                </Button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="mx-auto block text-sm text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                >
                    Log out
                </button>
            </form>
        </AuthLayout>
    );
}
