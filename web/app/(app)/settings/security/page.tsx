"use client";

import { useRef, useState } from "react";
import { useAuth, ValidationError } from "next-sanctum";
import { toast } from "sonner";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import ManagePasskeys from "@/components/manage-passkeys";
import ManageTwoFactor from "@/components/manage-two-factor";
import PasswordInput from "@/components/password-input";
import RequirePassword from "@/components/require-password";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { BreadcrumbItem } from "@/types";
import { Spinner } from "@/components/ui/spinner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Security settings",
        href: "/settings/security",
    },
];

export default function Security() {
    const auth = useAuth();
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await auth.updatePassword({
                current_password: currentPassword,
                password,
                password_confirmation: passwordConfirmation,
            });

            // Reset on success.
            setCurrentPassword("");
            setPassword("");
            setPasswordConfirmation("");

            toast.success("Password updated.");
            setRecentlySuccessful(true);
            window.setTimeout(() => setRecentlySuccessful(false), 2000);
        } catch (error) {
            if (error instanceof ValidationError) {
                const fieldErrors: Record<string, string> = {};
                for (const [field, messages] of Object.entries(error.errors)) {
                    fieldErrors[field] = messages[0];
                }
                setErrors(fieldErrors);

                // Reset the relevant fields and focus, mirroring the source behaviour.
                if (fieldErrors.password) {
                    setPassword("");
                    setPasswordConfirmation("");
                    passwordInput.current?.focus();
                }

                if (fieldErrors.current_password) {
                    setCurrentPassword("");
                    currentPasswordInput.current?.focus();
                }
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <h1 className="sr-only">Security settings</h1>

                <RequirePassword>
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Update password"
                            description="Ensure your account is using a long, random password to stay secure"
                        />

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    Current password
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    name="current_password"
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    placeholder="Current password"
                                />

                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">New password</Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    name="password"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="New password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    value={passwordConfirmation}
                                    onChange={(e) =>
                                        setPasswordConfirmation(e.target.value)
                                    }
                                    name="password_confirmation"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                >
                                    {processing && <Spinner />}
                                    Save
                                </Button>

                                {recentlySuccessful && (
                                    <p className="text-sm text-neutral-600">
                                        Saved
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>

                    <ManageTwoFactor />

                    <ManagePasskeys />
                </RequirePassword>
            </SettingsLayout>
        </AppLayout>
    );
}
