"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ValidationError } from "next-sanctum";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

/**
 * Gates its children behind Fortify's password-confirmation window. Mirrors the
 * `RequirePassword` middleware on the React starter kit's security route: if the
 * password hasn't been confirmed recently, a dialog asks for it before revealing
 * the protected content. Dismissing the dialog navigates back.
 */
export default function RequirePassword({
    children,
    title = "Confirm your password",
    description = "This is a secure area of the application. Please confirm your password before continuing.",
}: {
    children: React.ReactNode;
    title?: string;
    description?: string;
}) {
    const { confirmedPasswordStatus, confirmPassword } = useAuth();
    const router = useRouter();
    const [confirmed, setConfirmed] = useState<boolean | null>(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        let active = true;
        confirmedPasswordStatus()
            .then((ok) => {
                if (active) setConfirmed(ok);
            })
            .catch(() => {
                if (active) setConfirmed(false);
            });
        return () => {
            active = false;
        };
    }, [confirmedPasswordStatus]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setProcessing(true);
        setError(undefined);

        try {
            await confirmPassword({ password });
            setPassword("");
            setConfirmed(true);
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.errors.password?.[0]);
            } else {
                setError(
                    err instanceof Error
                        ? err.message
                        : "The password is incorrect.",
                );
            }
            setPassword("");
        } finally {
            setProcessing(false);
        }
    }

    if (confirmed === null) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner />
            </div>
        );
    }

    if (confirmed) {
        return <>{children}</>;
    }

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) router.back();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="require-password" className="sr-only">
                            Password
                        </Label>
                        <PasswordInput
                            id="require-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Password"
                            autoComplete="current-password"
                            autoFocus
                        />
                        <InputError message={error} />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Confirm password
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
