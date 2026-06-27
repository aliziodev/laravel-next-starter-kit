import { test, expect } from "@playwright/test";
import { login } from "./helpers";

/**
 * Exercises the full WebAuthn ceremony end-to-end using a CDP virtual
 * authenticator (resident key + user verification), so no real hardware or
 * biometric prompt is needed: register a passkey on the security page, then
 * sign in passwordlessly with it.
 */
test("a user can register a passkey and sign in with it", async ({
    page,
    context,
}) => {
    const client = await context.newCDPSession(page);
    await client.send("WebAuthn.enable");
    await client.send("WebAuthn.addVirtualAuthenticator", {
        options: {
            protocol: "ctap2",
            transport: "internal",
            hasResidentKey: true,
            hasUserVerification: true,
            isUserVerified: true,
            automaticPresenceSimulation: true,
        },
    });

    // 1. Log in and open the security settings (behind the password gate).
    await login(page);
    await page.goto("/settings/security");
    await page.locator("#require-password").fill("password");
    await page.getByRole("button", { name: "Confirm password" }).click();

    // 2. Register a passkey — the virtual authenticator completes the ceremony.
    await page.getByRole("button", { name: "Add passkey" }).click();
    await page.locator("#passkey-name").fill("E2E Passkey");
    await page.getByRole("button", { name: "Register passkey" }).click();

    // 3. It now appears in the list.
    await expect(page.getByText("E2E Passkey")).toBeVisible();

    // 4. Sign out (client-side) and sign back in with the passkey, passwordless.
    await context.clearCookies();
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in with a passkey" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
});
