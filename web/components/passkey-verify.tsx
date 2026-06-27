"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePasskeys } from "next-sanctum";
import { KeyRound } from "lucide-react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

/** A user dismissing the browser passkey prompt is not an error worth surfacing. */
function isUserCancellation(error: unknown): boolean {
    // @laravel/passkeys normalises a dismissed prompt to a named UserCancelledError;
    // raw DOMExceptions are kept as a fallback for other code paths.
    if (error instanceof Error && error.name === "UserCancelledError")
        return true;
    return (
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "AbortError")
    );
}

type Props = {
    redirectTo?: string;
    label?: string;
    loadingLabel?: string;
    separator?: string;
};

export default function PasskeyVerify({
    redirectTo = "/dashboard",
    label,
    loadingLabel,
    separator,
}: Props) {
    const passkeys = usePasskeys();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [supported, setSupported] = useState<boolean | null>(null);

    useEffect(() => {
        passkeys
            .isSupported()
            .then(setSupported)
            .catch(() => setSupported(false));
    }, [passkeys]);

    const handleVerify = async () => {
        setIsLoading(true);
        setError(undefined);

        try {
            await passkeys.login();
            router.push(redirectTo);
            router.refresh();
        } catch (err) {
            if (isUserCancellation(err)) {
                // Prompt dismissed — nothing to surface.
            } else if (err instanceof Error) {
                // @laravel/passkeys raises human-readable PasskeyError messages.
                setError(err.message);
            } else {
                setError("Passkey sign-in failed. Please try again.");
            }
            setIsLoading(false);
        }
    };

    // Hide entirely until support is confirmed, and on unsupported browsers.
    if (!supported) {
        return null;
    }

    return (
        <>
            <div className="grid gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleVerify}
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner /> : <KeyRound className="h-4 w-4" />}
                    {isLoading
                        ? (loadingLabel ?? "Authenticating...")
                        : (label ?? "Sign in with a passkey")}
                </Button>
                {error && (
                    <InputError message={error} className="text-center" />
                )}
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        {separator ?? "Or continue with email"}
                    </span>
                </div>
            </div>
        </>
    );
}
