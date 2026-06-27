"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser, ValidationError } from "next-sanctum";
import { toast } from "sonner";
import DeleteUser from "@/components/delete-user";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MUST_VERIFY_EMAIL } from "@/lib/email-verification";
import type { BreadcrumbItem, User } from "@/types";
import { Spinner } from "@/components/ui/spinner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Profile settings",
        href: "/settings/profile",
    },
];

export default function Profile() {
    const auth = useAuth<User>();
    const user = useUser<User>();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [verificationLinkSent, setVerificationLinkSent] = useState(false);

    // Seed the form once the authenticated user is available.
    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await auth.updateProfile({ name, email });
            toast.success("Profile updated.");
            setRecentlySuccessful(true);
            window.setTimeout(() => setRecentlySuccessful(false), 2000);
        } catch (error) {
            if (error instanceof ValidationError) {
                const fieldErrors: Record<string, string> = {};
                for (const [field, messages] of Object.entries(error.errors)) {
                    fieldErrors[field] = messages[0];
                }
                setErrors(fieldErrors);
            }
        } finally {
            setProcessing(false);
        }
    };

    const resendVerification = async () => {
        await auth.resendEmailVerification();
        setVerificationLinkSent(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <h1 className="sr-only">Profile settings</h1>

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile"
                        description="Update your name and email address"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                name="name"
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                name="email"
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.email}
                            />
                        </div>

                        {MUST_VERIFY_EMAIL &&
                            user &&
                            !user.email_verified_at && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        Your email address is unverified.{" "}
                                        <TextLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                resendVerification();
                                            }}
                                        >
                                            Click here to re-send the
                                            verification email.
                                        </TextLink>
                                    </p>

                                    {verificationLinkSent && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            A new verification link has been
                                            sent to your email address.
                                        </div>
                                    )}
                                </div>
                            )}

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
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

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
