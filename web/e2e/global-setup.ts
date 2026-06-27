import { execSync } from "node:child_process";
import path from "node:path";

/**
 * Seeds a known, verified `e2e@example.com` user (and resets its passkeys)
 * before the suite runs. Talks to the database directly via artisan, so it
 * doesn't depend on the web servers being up yet.
 */
export default function globalSetup() {
    const laravelRoot = path.resolve(process.cwd(), "..");
    execSync("php artisan db:seed --class=E2eSeeder --force", {
        cwd: laravelRoot,
        stdio: "inherit",
    });
}
