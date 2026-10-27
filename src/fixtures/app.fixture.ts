import { test as base, expect, type Page } from '@playwright/test';
import { ENV, ROUTES } from '../config/env';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { ReportPage } from '../pages/ReportPage';
import { ThemeStudioPage } from '../pages/ThemeStudioPage';

export interface App {
  page: Page;
  dashboard: DashboardPage;
  report: ReportPage;
  themeStudio: ThemeStudioPage;
}

/** Authenticates the given page. Credentials come from .env, never from source. */
export async function signIn(page: Page): Promise<void> {
  await page.goto(ROUTES.login);
  const login = new LoginPage(page);
  await login.login(ENV.email, ENV.password);

  const dashboard = new DashboardPage(page);
  await dashboard.expectLoaded();
  await dashboard.dismissIntro();
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    await signIn(page);
    await use({
      page,
      dashboard: new DashboardPage(page),
      report: new ReportPage(page),
      themeStudio: new ThemeStudioPage(page),
    });
  },
});

export { expect };
