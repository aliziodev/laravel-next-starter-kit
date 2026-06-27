import { expect, type Page } from "@playwright/test";

export const E2E_USER = { email: "e2e@example.com", password: "password" };

/** Log in via the email/password form and wait for the dashboard. */
export async function login(
    page: Page,
    email = E2E_USER.email,
    password = E2E_USER.password,
) {
    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByTestId("login-button").click();
    await expect(page).toHaveURL(/\/dashboard/);
}
