"use client";

import type { LucideIcon } from "lucide-react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// `true` only after hydration (the server snapshot is `false`). next-themes
// can't know the theme during SSR, so we wait before highlighting the active
// tab to avoid a hydration mismatch — without a setState-in-effect.
const subscribe = () => () => {};
const useMounted = () =>
    useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );

export default function AppearanceToggleTab({
    className = "",
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { theme, setTheme } = useTheme();
    const mounted = useMounted();

    const tabs: { value: string; icon: LucideIcon; label: string }[] = [
        { value: "light", icon: Sun, label: "Light" },
        { value: "dark", icon: Moon, label: "Dark" },
        { value: "system", icon: Monitor, label: "System" },
    ];

    return (
        <div
            className={cn(
                "inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800",
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                        "flex items-center rounded-md px-3.5 py-1.5 transition-colors",
                        mounted && theme === value
                            ? "bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100"
                            : "text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60",
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
