import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(callback: () => void): () => void {
    const mql = window.matchMedia(QUERY);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
}

/**
 * Whether the viewport is below the mobile breakpoint. Uses `useSyncExternalStore`
 * so it's SSR-safe (server snapshot is `false`) without a setState-in-effect.
 */
export function useIsMobile(): boolean {
    return React.useSyncExternalStore(
        subscribe,
        () => window.matchMedia(QUERY).matches,
        () => false,
    );
}
