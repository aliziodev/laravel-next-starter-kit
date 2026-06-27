import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { SanctumProviders } from "../providers";

/**
 * Authenticated area. This group layout enforces auth once for every page inside
 * it — the decoupled equivalent of `Route::middleware('auth')->group(...)` — so
 * the pages themselves stay plain content. (The route proxy is an optimistic
 * fast-path; this server check is authoritative.)
 */
export default async function AppGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();
    if (!user) redirect("/login");

    return <SanctumProviders initialUser={user}>{children}</SanctumProviders>;
}
