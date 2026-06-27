"use client";

import { KeyRound } from "lucide-react";
import { useApi, usePasskeys } from "next-sanctum";
import { toast } from "sonner";
import Heading from "@/components/heading";
import PasskeyItem from "@/components/passkey-item";
import PasskeyRegistration from "@/components/passkey-register";
import { Skeleton } from "@/components/ui/skeleton";
import type { Passkey } from "@/types";

const EmptyState = () => (
    <div className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <KeyRound className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="font-medium">No passkeys yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
            Add a passkey to sign in without a password
        </p>
    </div>
);

export default function ManagePasskeys() {
    const passkeys = usePasskeys();
    const { data, isLoading, refetch } = useApi<Passkey[]>("/api/passkeys");
    const items = data ?? [];

    const handleDelete = async (id: number) => {
        try {
            await passkeys.delete(String(id));
            toast.success("Passkey removed.");
            await refetch();
        } catch {
            toast.error("Unable to remove passkey. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Passkeys"
                description="Manage your passkeys for passwordless sign-in"
            />

            <div className="overflow-hidden rounded-lg border border-border">
                {isLoading ? (
                    <div className="space-y-3 p-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : items.length > 0 ? (
                    items.map((passkey) => (
                        <PasskeyItem
                            key={passkey.id}
                            passkey={passkey}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>

            <PasskeyRegistration onSuccess={refetch} />
        </div>
    );
}
