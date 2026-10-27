import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../config/env';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.dashboard);
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page, 'Dashboard route should be active').toHaveURL(/\/#\/dashboard\/overview/);
    await expect(this.banner, 'Application header should be visible').toBeVisible();
  }

  async openReports(): Promise<void> {
    await this.ensureSidebarExpanded();
    await this.reportNav.click();
    await expect(this.page).toHaveURL(/\/#\/dashboard\/reports/);
  }

  async openThemeStudio(): Promise<void> {
    await this.ensureSidebarExpanded();
    await this.themeStudioNav.click();
    await expect(this.page).toHaveURL(/themeStudio=true/);
  }
}
