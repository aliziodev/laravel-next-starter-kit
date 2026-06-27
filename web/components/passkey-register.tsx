"use client";

import { useEffect, useState } from "react";
import { usePasskeys, ValidationError } from "next-sanctum";
import { toast } from "sonner";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

/** A friendly default passkey name derived from the current browser + OS. */
function detectDeviceName(): string {
    if (typeof navigator === "undefined") return "";
    const ua = navigator.userAgent;

    const browser = [
        { pattern: /Edg|Edge/, name: "Edge" },
        { pattern: /OPR|Opera|OPiOS/, name: "Opera" },
        { pattern: /Firefox|FxiOS/, name: "Firefox" },
        { pattern: /Chrome|CriOS/, name: "Chrome" },
        { pattern: /Safari/, name: "Safari" },
    ].find(({ pattern }) => pattern.test(ua))?.name;

    const os = [
        { pattern: /iPhone/, name: "iPhone" },
        { pattern: /iPad|Macintosh(?=.*Mobile)/, name: "iPad" },
        { pattern: /Android/, name: "Android" },
        { pattern: /Mac/, name: "Mac" },
        { pattern: /Windows/, name: "Windows" },
    ].find(({ pattern }) => pattern.test(ua))?.name;

    return [browser, os].filter(Boolean).join(" on ") || "";
}

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
    onSuccess: () => void;
};

export default function PasskeyRegistration({ onSuccess }: Props) {
    const passkeys = usePasskeys();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [supported, setSupported] = useState<boolean | null>(null);

    useEffect(() => {
        passkeys
            .isSupported()
            .then(setSupported)
            .catch(() => setSupported(false));
    }, [passkeys]);

    const handleOpenChange = (next: boolean) => {
        // Don't let the dialog close mid-ceremony.
        if (isLoading) return;
        setOpen(next);
        setError(undefined);
        // Default the name to the current browser/OS when opening; reset on close.
        setName(next ? (current) => current || detectDeviceName() : "");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) {
            return;
        }

        setIsLoading(true);
        setError(undefined);

        try {
            await passkeys.register(name.trim());
            toast.success("Passkey registered.");
            onSuccess();
            setOpen(false);
            setName("");
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.errors.name?.[0] ?? "Unable to register passkey.");
            } else if (isUserCancellation(err)) {
                // Prompt dismissed — nothing to surface.
            } else if (err instanceof Error) {
                // @laravel/passkeys raises human-readable PasskeyError messages
                // (e.g. invalid domain, this device is already registered).
                setError(err.message);
            } else {
                setError("Unable to register passkey. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (supported === false) {
        return (
            <div className="text-sm text-muted-foreground">
                Passkeys are not supported in this browser.
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={supported === null}>
                    Add passkey
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add a passkey</DialogTitle>
                        <DialogDescription>
                            Passkeys let you sign in without a password, using
                            your device&apos;s biometrics, PIN, or a security
                            key.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2 py-4">
                        <Label htmlFor="passkey-name">Passkey name</Label>
                        <Input
                            id="passkey-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., MacBook Pro, iPhone"
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            A name helps you identify this passkey later.
                        </p>
                        {error && <InputError message={error} />}
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                        >
                            {isLoading && <Spinner />}
                            {isLoading ? "Registering..." : "Register passkey"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
