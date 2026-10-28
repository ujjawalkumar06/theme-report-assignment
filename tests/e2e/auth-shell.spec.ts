import { test, expect } from '../../src/fixtures/app.fixture';
import { test as rawTest } from '@playwright/test';
import { ENV, ROUTES } from '../../src/config/env';
import { LoginPage } from '../../src/pages/LoginPage';

rawTest.describe('Login page', () => {
  rawTest('E2E-LOGIN-02 - invalid credentials show an inline error', async ({ page }) => {
    await page.goto(ROUTES.login);
    const login = new LoginPage(page);
    await login.loginExpectingError(ENV.email, 'WrongPass1');
    await expect(page).toHaveURL(/\/#\/login/);
  });

  rawTest('E2E-LOGIN-03 - empty fields keep Sign in disabled', async ({ page }) => {
    await page.goto(ROUTES.login);
    const login = new LoginPage(page);
    await expect(login.signInButton).toBeDisabled();
  });

  rawTest('E2E-LOGIN-04 - Show/Hide password toggles the input', async ({ page }) => {
    await page.goto(ROUTES.login);
    const login = new LoginPage(page);
    await login.passwordInput.fill(ENV.password);
    await login.showPasswordButton.click();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Hide Password' })).toBeVisible();
    await login.showPasswordButton.click();
    await expect(page.locator('input[type="password"]')).toHaveCount(1);
  });

  rawTest('E2E-LOGIN-06 - Forgot password shows admin contact guidance', async ({ page }) => {
    await page.goto(ROUTES.login);
    const login = new LoginPage(page);
    await expect(page.getByTitle('Please contact admin@oomnieye.com')).toBeVisible();
  });

  rawTest('E2E-LOGIN-07 - unauthenticated deep link redirects to login', async ({ page }) => {
    await page.goto(ROUTES.reports);
    await expect(page).toHaveURL(/\/#\/login/);
  });
});

test.describe('Authenticated shell', () => {
  test('E2E-LOGIN-01 - valid login reaches the dashboard', async ({ app }) => {
    await expect(app.page).toHaveURL(/\/#\/dashboard\/overview/);
  });

  test('E2E-LOGIN-09 - session survives reload', async ({ app }) => {
    await app.page.reload();
    await app.dashboard.expectLoaded();
    await expect(app.page).not.toHaveURL(/\/#\/login/);
  });

  test('E2E-LOGIN-08 - logout clears the session', async ({ app }) => {
    await app.dashboard.signOut();
    await expect(app.page).toHaveURL(/\/#\/login/);
  });

  test('E2E-DASH-01 - dashboard shell renders', async ({ app }) => {
    await expect(app.dashboard.banner).toBeVisible();
    await expect(app.page.getByText('Set up Your')).toBeVisible();
  });

  test('E2E-DASH-03 - sidebar collapses and expands', async ({ app }) => {
    await app.page.locator('button[title="Collapse sidebar"]').first().click();
    await expect(app.page.getByRole('button', { name: 'Open sidebar' })).toBeVisible();
    await app.page.getByRole('button', { name: 'Open sidebar' }).click();
    await expect(app.dashboard.dashboardNav).toBeVisible();
  });

  test('E2E-DASH-05 - fullscreen enters and exits', async ({ app }) => {
    await app.dashboard.fullscreenButton.click();
    await expect.poll(() => app.page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
    await app.page.evaluate(() => document.exitFullscreen());
    await expect.poll(() => app.page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  });

  test('E2E-DASH-11 - Global Settings opens with Header/Footer tabs', async ({ app }) => {
    await app.dashboard.globalSettingsButton.click();
    await expect(app.page.getByText('Global Settings', { exact: true })).toBeVisible();
    await expect(app.page.getByRole('tab', { name: 'Header' })).toBeVisible();
    await expect(app.page.getByRole('tab', { name: 'Footer' })).toBeVisible();
    await app.page.locator('.gs-top-btn-cancel').click();
  });

  test('E2E-DASH-12 - Notifications panel opens', async ({ app }) => {
    await app.dashboard.notificationsButton.click();
    await expect(app.page.getByText(/Unread \(\d+\)/).first()).toBeVisible();
    await expect(app.page.getByText('Mentions', { exact: true }).first()).toBeVisible();
  });

  test('E2E-DASH-13 - Account menu opens', async ({ app }) => {
    await app.dashboard.openAccountMenu();
    await expect(app.page.getByText('Edit Profile', { exact: true })).toBeVisible();
  });

  test('E2E-DASH-14 - Help panel opens', async ({ app }) => {
    await app.dashboard.helpButton.click();
    await expect(app.page.getByText('Replay Greeting', { exact: true }).first()).toBeVisible();
  });
});
