"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ValidationError } from "next-sanctum";
import { toast } from "sonner";
import InputError from "@/components/input-error";
import PasskeyVerify from "@/components/passkey-verify";
import PasswordInput from "@/components/password-input";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
    const { login } = useAuth();
    const router = useRouter();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setProcessing(true);
        setErrors({});

        try {
            const result = await login({
                email: String(data.get("email") ?? ""),
                password: String(data.get("password") ?? ""),
                remember: data.get("remember") === "on",
            });
            toast.success("Signed in successfully.");
            router.push(
                result.status === "two-factor-required"
                    ? "/two-factor-challenge"
                    : redirectTo,
            );
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
                    email: "Unable to log in. Please try again.",
                });
            }
        } finally {
            setProcessing(false);
        }
    }

    return (
        <>
            <PasskeyVerify redirectTo={redirectTo} />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <TextLink
                                href="/forgot-password"
                                className="ml-auto text-sm"
                                tabIndex={5}
                            >
                                Forgot your password?
                            </TextLink>
                        </div>
                        <PasswordInput
                            id="password"
                            name="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" tabIndex={3} />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={4}
                        disabled={processing}
                        data-test="login-button"
                    >
                        {processing && <Spinner />}
                        Log in
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <TextLink href="/register" tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>
        </>
    );
}
