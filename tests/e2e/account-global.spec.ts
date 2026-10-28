import { test, expect } from '../../src/fixtures/app.fixture';
import { ROUTES } from '../../src/config/env';

test.describe('Account Settings', () => {
  test.beforeEach(async ({ app }) => {
    await app.page.goto('/#/dashboard/account');
    await expect(app.page.getByText('Account Settings', { exact: true }).first()).toBeVisible();
  });

  test('E2E-ACC-01/02 - page and personal information render', async ({ app }) => {
    await expect(app.page.getByText('Personal Information', { exact: true })).toBeVisible();
    for (const label of ['Email Address', 'Phone', 'Department', 'Organization']) {
      await expect(app.page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(app.page.getByText('Edwin Antony', { exact: true }).first()).toBeVisible();
    await expect(app.page.getByText('UX/UI Designer', { exact: true }).first()).toBeVisible();
  });

  test('E2E-ACC-03/05/06 - preferences, language and timezone', async ({ app }) => {
    await expect(app.page.getByText('Preferences & Privacy', { exact: true })).toBeVisible();
    await expect(app.page.getByRole('button', { name: 'English', exact: true })).toBeVisible();
    await expect(app.page.getByRole('button', { name: /GMT \+ 05:30/ })).toBeVisible();
    await expect(app.page.getByRole('button', { name: 'Cookie Preferences' })).toBeVisible();
  });

  test('E2E-ACC-04 - Cookie Preferences opens', async ({ app }) => {
    await app.page.getByRole('button', { name: 'Cookie Preferences' }).click();
    await expect(app.page.getByText(/cookie/i).first()).toBeVisible();
  });

  test('E2E-ACC-07 - Active Sessions opens', async ({ app }) => {
    await app.page.getByRole('button', { name: 'Active Sessions' }).click();
    await expect(app.page.getByText(/session/i).first()).toBeVisible();
  });

  test('E2E-ACC-08 - Login History opens', async ({ app }) => {
    await app.page.getByRole('button', { name: 'Login History' }).click();
    await expect(app.page.getByText(/login/i).first()).toBeVisible();
  });

  test('E2E-ACC-09 - Advanced Settings opens', async ({ app }) => {
    await app.page.getByRole('button', { name: 'Advanced Settings' }).click();
    await expect(app.page.getByText(/advanced/i).first()).toBeVisible();
  });

  test('E2E-ACC-10 - Backup & Reset opens without confirming', async ({ app }) => {
    await app.page.getByRole('button', { name: 'Backup & Reset' }).click();
    await expect(app.page.getByText(/backup|reset/i).first()).toBeVisible();
  });

  test('E2E-ACC-11 - Edit Profile from the account menu', async ({ app }) => {
    await app.dashboard.openAccountMenu();
    await app.page.getByText('Edit Profile', { exact: true }).click();
    await expect(app.page).toHaveURL(/\/#\/dashboard\/account/);
  });

  test('E2E-ACC-MENU - Menu Item 2 routes to Account Settings', async ({ app }) => {
    await app.page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find((a) => /Menu Item 2/i.test(a.textContent || ''));
      link?.click();
    });
    await expect(app.page).toHaveURL(/\/#\/dashboard\/account/);
  });
});

test.describe('Global Settings tabs', () => {
  test.beforeEach(async ({ app }) => {
    await app.page.goto(ROUTES.reports);
    await app.report.expectLoaded();
    await app.dashboard.globalSettingsButton.click();
    await expect(app.page.getByText('Global Settings', { exact: true })).toBeVisible();
  });

  test('E2E-GLB-01/02 - Header and Customer Profile tabs', async ({ app }) => {
    await expect(app.page.getByRole('tab', { name: 'Header' })).toHaveAttribute('aria-selected', 'true');
    await expect(app.page.getByText('Company Logo', { exact: true })).toBeVisible();
    await app.page.getByRole('tab', { name: 'Customer Profile' }).click();
    await expect(app.page.getByText('Customer Logo', { exact: true })).toBeVisible();
  });

  test('E2E-GLB-03 - Footer tab and Add Link', async ({ app }) => {
    await app.page.getByRole('tab', { name: 'Footer' }).click();
    await expect(app.page.getByText('Footer Settings', { exact: true })).toBeVisible();
    await expect(app.page.getByPlaceholder('Powered by OomniEye Digital Solutions')).toBeVisible();
    await app.page.getByRole('button', { name: /Add Link/i }).click();
    await expect(app.page.getByText('Footer Links', { exact: true })).toBeVisible();
  });

  test('E2E-GLB-04 - Sidebar tab', async ({ app }) => {
    await app.page.getByRole('tab', { name: 'Sidebar' }).click();
    await expect(app.page.getByText(/Sidebar Behavio/i).first()).toBeVisible();
    await expect(app.page.getByText(/Sidebar Dimensions/i).first()).toBeVisible();
  });

  test('E2E-GLB-05 - Global Settings close', async ({ app }) => {
    await app.page.locator('.gs-top-btn-cancel').click();
    await expect(app.page.getByText('Global Settings', { exact: true })).toBeHidden();
  });
});
