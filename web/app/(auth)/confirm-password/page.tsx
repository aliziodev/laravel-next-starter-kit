"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ValidationError } from "next-sanctum";
import AuthLayout from "@/layouts/auth-layout";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function ConfirmPassword() {
    const { confirmPassword } = useAuth();
    const router = useRouter();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setProcessing(true);
        setErrors({});

        try {
            await confirmPassword({
                password: String(data.get("password") ?? ""),
            });
            router.push("/dashboard");
            router.refresh();
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
                    password:
                        error instanceof Error
                            ? error.message
                            : "Unable to confirm the password.",
                });
            }
        } finally {
            setProcessing(false);
        }
    }

    return (
        <AuthLayout
            title="Confirm password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            autoFocus
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <Button
                            className="w-full"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner />}
                            Confirm password
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
