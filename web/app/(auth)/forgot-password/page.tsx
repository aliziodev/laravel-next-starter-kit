"use client";

import { useState } from "react";
import { useAuth, ValidationError } from "next-sanctum";
import { toast } from "sonner";
import AuthLayout from "@/layouts/auth-layout";
import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPassword() {
    const { forgotPassword } = useAuth();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setProcessing(true);
        setErrors({});
        setStatus(null);

        try {
            await forgotPassword({ email: String(data.get("email") ?? "") });
            toast.success("Password reset link sent.");
            setStatus("A reset link has been sent if the account exists.");
        } catch (error) {
            if (error instanceof ValidationError) {
                setErrors(
                    Object.fromEntries(
                        Object.entries(error.errors).map(([key, value]) => [
                            key,
                            value[0],
                        ]),
                    ),
                );
            } else {
                setErrors({
                    email: "Unable to send the reset link. Please try again.",
                });
            }
        } finally {
            setProcessing(false);
        }
    }

    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            autoFocus
                            placeholder="email@example.com"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button
                            className="w-full"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing && <Spinner />}
                            Email password reset link
                        </Button>
                    </div>
                </form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href="/login">log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
