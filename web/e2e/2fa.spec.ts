import { test, expect, type Locator } from "@playwright/test";
import { Secret, TOTP } from "otpauth";

const USER = { email: "2fa@example.com", password: "password" };

/** A current 6-digit TOTP for the given base32 secret (Fortify defaults: SHA1/6/30). */
function totpFor(secret: string): string {
    return new TOTP({
        secret: Secret.fromBase32(secret.replace(/\s/g, "")),
        digits: 6,
        period: 30,
        algorithm: "SHA1",
    }).generate();
}

/**
 * Type a TOTP into an input-otp field and confirm every digit landed before the
 * caller submits — the challenge form's button is always enabled, so a partially
 * filled code would otherwise be submitted and rejected.
 */
async function enterOtp(input: Locator, secret: string): Promise<void> {
    const code = totpFor(secret);
    await input.click();
    await input.fill("");
    await input.pressSequentially(code, { delay: 50 });
    await expect(input).toHaveValue(code);
}

/**
 * Wait until the start of the next 30s TOTP window. The enable-confirm consumes
 * the current window's code; the login challenge must use a fresh, different
 * code (the same code is not accepted twice).
 */
async function waitForFreshTotpWindow(): Promise<void> {
    const period = 30_000;
    await new Promise((resolve) =>
        setTimeout(resolve, period - (Date.now() % period) + 750),
    );
}

test("a user can enable 2FA and use it at login", async ({ page }) => {
    test.setTimeout(180_000); // includes a wait for a fresh TOTP window

    // 1. Log in and open the security settings (behind the password gate).
    await page.goto("/login");
    await page.locator("#email").fill(USER.email);
    await page.locator("#password").fill(USER.password);
    await page.getByTestId("login-button").click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/settings/security");
    await page.locator("#require-password").fill(USER.password);
    await page.getByRole("button", { name: "Confirm password" }).click();

    // 2. Enable 2FA and read the shared secret from the setup dialog.
    await page.getByRole("button", { name: /Enable 2FA/i }).click();
    const secretInput = page.getByRole("dialog").locator("input[readonly]");
    await expect(secretInput).toBeVisible();
    await expect(secretInput).not.toHaveValue("");
    const secret = await secretInput.inputValue();

    // 3. Continue to the verification step and confirm with a fresh code.
    await page.getByRole("button", { name: "Continue" }).click();
    await enterOtp(page.locator("#otp"), secret);
    await page.getByRole("button", { name: "Confirm" }).click();

    // 4. Two-factor authentication is now enabled.
    await expect(
        page.getByRole("button", { name: "Disable 2FA" }),
    ).toBeVisible();

    // 5. Log out cleanly via the user menu, then log back in — now challenged.
    await page
        .getByRole("button", { name: /2FA User/i })
        .first()
        .click();
    await page.getByTestId("logout-button").click();
    await expect(page).toHaveURL(/\/login/);

    await page.locator("#email").fill(USER.email);
    await page.locator("#password").fill(USER.password);
    await page.getByTestId("login-button").click();
    await expect(page).toHaveURL(/\/two-factor-challenge/);

    await waitForFreshTotpWindow();
    await enterOtp(page.locator('input[name="code"]'), secret);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
});
