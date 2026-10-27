import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Shared application shell behaviour: sidebar navigation, the first-run intro
 * overlay, and theme state that lives on <html>.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  get banner(): Locator {
    return this.page.getByRole('banner').first();
  }

  get dashboardNav(): Locator {
    return this.page.getByRole('link', { name: 'Dashboard', exact: true });
  }

  get reportNav(): Locator {
    return this.page.getByRole('link', { name: 'Report Builder', exact: true });
  }

  get themeStudioNav(): Locator {
    return this.page.getByRole('link', { name: 'Theme Studio', exact: true });
  }

  /** The sidebar collapses responsively, hiding link labels. Expand it first. */
  async ensureSidebarExpanded(): Promise<void> {
    const expand = this.page.getByRole('button', { name: /(Open|Expand) sidebar/i });
    if (await expand.first().isVisible().catch(() => false)) {
      await expand.first().click();
    }
    await expect(this.dashboardNav).toBeVisible();
  }

  /**
   * The staging app shows a full-screen intro on the dashboard after login.
   * Dismiss it when present so it cannot intercept clicks.
   */
  async dismissIntro(): Promise<void> {
    const skip = this.page.locator('[aria-label="Click anywhere to skip intro"]');
    if ((await skip.count()) === 0) return;

    await skip.first().waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
    if (await skip.first().isVisible().catch(() => false)) {
      await skip.first().click({ timeout: 5_000 }).catch(() => undefined);
    }
    await expect(skip).toHaveCount(0, { timeout: 10_000 }).catch(() => undefined);
  }

  async currentHash(): Promise<string> {
    return this.page.evaluate(() => window.location.hash);
  }

  async currentThemeMode(): Promise<string | null> {
    return this.page.evaluate(() => document.documentElement.getAttribute('data-theme-mode'));
  }
}
