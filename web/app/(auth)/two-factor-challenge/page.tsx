"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTwoFactor, ValidationError } from "next-sanctum";
import AuthLayout from "@/layouts/auth-layout";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { OTP_MAX_LENGTH } from "@/hooks/use-two-factor-auth";
import { Spinner } from "@/components/ui/spinner";

export default function TwoFactorChallenge() {
    const { challenge } = useTwoFactor();
    const router = useRouter();
    const [showRecoveryInput, setShowRecoveryInput] = useState(false);
    const [code, setCode] = useState("");
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const authConfigContent = useMemo(() => {
        if (showRecoveryInput) {
            return {
                title: "Recovery code",
                description:
                    "Please confirm access to your account by entering one of your emergency recovery codes.",
                toggleText: "login using an authentication code",
            };
        }

        return {
            title: "Authentication code",
            description:
                "Enter the authentication code provided by your authenticator application.",
            toggleText: "login using a recovery code",
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = () => {
        setShowRecoveryInput((value) => !value);
        setErrors({});
        setCode("");
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setProcessing(true);
        setErrors({});

        try {
            if (showRecoveryInput) {
                await challenge({
                    recovery_code: String(data.get("recovery_code") ?? ""),
                });
            } else {
                await challenge({ code });
            }
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
                    code: "The code could not be verified. Please try again.",
                });
            }
            setCode("");
        } finally {
            setProcessing(false);
        }
    }

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {showRecoveryInput ? (
                        <>
                            <Input
                                name="recovery_code"
                                type="text"
                                placeholder="Enter recovery code"
                                autoFocus
                                required
                            />
                            <InputError message={errors.recovery_code} />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-3 text-center">
                            <div className="flex w-full items-center justify-center">
                                <InputOTP
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    value={code}
                                    onChange={(value) => setCode(value)}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        {Array.from(
                                            { length: OTP_MAX_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <InputError message={errors.code} />
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Continue
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        <span>or you can </span>
                        <button
                            type="button"
                            className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                            onClick={toggleRecoveryMode}
                        >
                            {authConfigContent.toggleText}
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
