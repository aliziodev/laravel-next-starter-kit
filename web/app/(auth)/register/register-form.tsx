"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ValidationError } from "next-sanctum";
import { toast } from "sonner";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export function RegisterForm() {
    const { register } = useAuth();
    const router = useRouter();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setProcessing(true);
        setErrors({});

        try {
            await register({
                name: String(data.get("name") ?? ""),
                email: String(data.get("email") ?? ""),
                password: String(data.get("password") ?? ""),
                password_confirmation: String(
                    data.get("password_confirmation") ?? "",
                ),
            });
            toast.success("Account created.");
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
                    email: "Unable to create your account. Please try again.",
                });
            }
        } finally {
            setProcessing(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        name="name"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="name"
                        placeholder="Full name"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        required
                        tabIndex={2}
                        autoComplete="email"
                        placeholder="email@example.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        name="password"
                        required
                        tabIndex={3}
                        autoComplete="new-password"
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
                        required
                        tabIndex={4}
                        autoComplete="new-password"
                        placeholder="Confirm password"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button
                    type="submit"
                    className="mt-2 w-full"
                    tabIndex={5}
                    disabled={processing}
                    data-test="register-user-button"
                >
                    {processing && <Spinner />}
                    Create account
                </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <TextLink href="/login" tabIndex={6}>
                    Log in
                </TextLink>
            </div>
        </form>
    );
}
