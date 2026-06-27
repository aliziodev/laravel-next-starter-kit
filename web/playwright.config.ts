import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

/**
 * Drives the full decoupled stack: the Laravel API (:8000) and the Next.js app
 * (:3000). Locally it reuses already-running dev servers; in CI it boots both.
 * Chromium only — the passkey ceremony relies on a CDP virtual authenticator.
 */
export default defineConfig({
    testDir: "./e2e",
    globalSetup: "./e2e/global-setup.ts",
    fullyParallel: false,
    workers: 1,
    forbidOnly: isCI,
    retries: isCI ? 1 : 0,
    reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
    // Generous because a cold `next dev` compiles each route on first hit.
    timeout: 120_000,
    expect: { timeout: 15_000 },
    use: {
        baseURL: "http://localhost:3000",
        testIdAttribute: "data-test",
        trace: "on-first-retry",
        navigationTimeout: 60_000,
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: [
        {
            command: "php artisan serve --port=8000",
            cwd: "..",
            url: "http://localhost:8000",
            reuseExistingServer: !isCI,
            timeout: 120_000,
        },
        {
            command: isCI ? "pnpm build && pnpm start" : "pnpm dev",
            url: "http://localhost:3000",
            reuseExistingServer: !isCI,
            timeout: 180_000,
        },
    ],
});
