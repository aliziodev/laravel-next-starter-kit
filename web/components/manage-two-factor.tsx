"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth, useTwoFactor, useUser } from "next-sanctum";
import { toast } from "sonner";
import Heading from "@/components/heading";
import TwoFactorRecoveryCodes from "@/components/two-factor-recovery-codes";
import TwoFactorSetupModal from "@/components/two-factor-setup-modal";
import { Button } from "@/components/ui/button";
import { useTwoFactorAuth } from "@/hooks/use-two-factor-auth";
import type { User } from "@/types";
import { Spinner } from "./ui/spinner";

export default function ManageTwoFactor() {
    const requiresConfirmation = true;

    const user = useUser<User>();
    const tf = useTwoFactor();
    const auth = useAuth<User>();

    const twoFactorEnabled = user?.two_factor_confirmed_at != null;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const [isEnabling, setIsEnabling] = useState<boolean>(false);
    const [isDisabling, setIsDisabling] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Two-factor authentication"
                description="Manage your two-factor authentication settings"
            />
            {twoFactorEnabled ? (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You will be prompted for a secure, random pin during
                        login, which you can retrieve from the TOTP-supported
                        application on your phone.
                    </p>

                    <div className="relative inline">
                        <Button
                            variant="destructive"
                            type="button"
                            disabled={isDisabling}
                            onClick={async () => {
                                setIsDisabling(true);
                                try {
                                    await tf.disable();
                                    clearTwoFactorAuthData();
                                    await auth.refresh();
                                    toast.success(
                                        "Two-factor authentication disabled.",
                                    );
                                } catch {
                                    toast.error(
                                        "Something went wrong. Please try again.",
                                    );
                                } finally {
                                    setIsDisabling(false);
                                }
                            }}
                        >
                            {isDisabling && <Spinner />}
                            Disable 2FA
                        </Button>
                    </div>

                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <p className="text-sm text-muted-foreground">
                        When you enable two-factor authentication, you will be
                        prompted for a secure pin during login. This pin can be
                        retrieved from a TOTP-supported application on your
                        phone.
                    </p>

                    <div>
                        {hasSetupData ? (
                            <Button onClick={() => setShowSetupModal(true)}>
                                <ShieldCheck />
                                Continue setup
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled={isEnabling}
                                onClick={async () => {
                                    setIsEnabling(true);
                                    try {
                                        await tf.enable();
                                        await fetchSetupData();
                                        setShowSetupModal(true);
                                    } catch {
                                        toast.error(
                                            "Something went wrong. Please try again.",
                                        );
                                    } finally {
                                        setIsEnabling(false);
                                    }
                                }}
                            >
                                {isEnabling && <Spinner />}
                                Enable 2FA
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </div>
    );
}
