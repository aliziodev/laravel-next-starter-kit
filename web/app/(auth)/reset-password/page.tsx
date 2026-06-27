"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ValidationError } from "next-sanctum";
import { toast } from "sonner";
import AuthLayout from "@/layouts/auth-layout";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

function ResetPasswordForm() {
    const { resetPassword } = useAuth();
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get("token") ?? "";
    const email = params.get("email") ?? "";
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setProcessing(true);
        setErrors({});

        try {
            await resetPassword({
                token,
                email,
                password: String(data.get("password") ?? ""),
                password_confirmation: String(
                    data.get("password_confirmation") ?? "",
                ),
            });
            toast.success("Password reset successfully. Please sign in.");
            router.push("/login");
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
                    email: "Unable to reset the password. Please try again.",
                });
            }
        } finally {
            setProcessing(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        defaultValue={email}
                        className="mt-1 block w-full"
                        readOnly
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                        autoFocus
                        placeholder="Password"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">
                        Confirm password
                    </Label>
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                        placeholder="Confirm password"
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <Button
                    type="submit"
                    className="mt-4 w-full"
                    disabled={processing}
                    data-test="reset-password-button"
                >
                    {processing && <Spinner />}
                    Reset password
                </Button>
            </div>
        </form>
    );
}

export default function ResetPassword() {
    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <Suspense fallback={null}>
                <ResetPasswordForm />
            </Suspense>
        </AuthLayout>
    );
}
