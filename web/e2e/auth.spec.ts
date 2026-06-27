import { test, expect } from "@playwright/test";
import { E2E_USER, login } from "./helpers";

test.describe("authentication", () => {
    test("a verified user can log in", async ({ page }) => {
        await login(page);
        await expect(page.getByText("E2E User").first()).toBeVisible();
    });

    test("invalid credentials are rejected", async ({ page }) => {
        await page.goto("/login");
        await page.locator("#email").fill(E2E_USER.email);
        await page.locator("#password").fill("wrong-password");
        await page.getByTestId("login-button").click();

        await expect(page).toHaveURL(/\/login/);
        await expect(
            page.getByText(/credentials do not match|unable to log in/i),
        ).toBeVisible();
    });

    test("a new user can register", async ({ page }) => {
        const email = `e2e-${Date.now()}@example.com`;
        await page.goto("/register");
        await page.locator("#name").fill("E2E New User");
        await page.locator("#email").fill(email);
        await page.locator("#password").fill("password");
        await page.locator("#password_confirmation").fill("password");
        await page.getByTestId("register-user-button").click();

        // Email verification is off by default, so a new account lands on the dashboard.
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test("a user can log out", async ({ page }) => {
        await login(page);
        await page
            .getByRole("button", { name: /E2E User/i })
            .first()
            .click();
        await page.getByTestId("logout-button").click();
        await expect(page).toHaveURL(/\/login/);
    });
});
