import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../config/env';

export class ReportPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Reports', exact: true });
  }

  get tables(): Locator {
    return this.page.locator('main table');
  }

  get headerTable(): Locator {
    return this.tables.first();
  }

  get dataTable(): Locator {
    return this.tables.last();
  }

  get rows(): Locator {
    return this.dataTable.locator('tbody tr');
  }

  get firstRow(): Locator {
    return this.rows.first();
  }

  get searchButton(): Locator {
    return this.page.getByRole('button', { name: 'Search', exact: true });
  }

  get filterButton(): Locator {
    return this.page.getByRole('button', { name: 'Filter', exact: true });
  }

  get filterPanel(): Locator {
    return this.page
      .locator('.MuiPaper-root')
      .filter({ has: this.page.getByText('Filter columns', { exact: true }) })
      .first();
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.reports);
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page, 'Report route should be active').toHaveURL(/\/#\/dashboard\/reports/);
    await expect(this.page.getByText('Test', { exact: true }).first(), 'Report view breadcrumb should render').toBeVisible();
    await expect(this.headerTable, 'Report table header should be visible').toBeVisible();
    await expect(this.firstRow, 'Report table should contain data rows').toBeVisible();
  }

  async openFilter(): Promise<void> {
    await this.filterButton.click();
    await expect(this.filterPanel, 'Filter panel should open').toBeVisible();
    await expect(this.page.getByText('Filter columns', { exact: true })).toBeVisible();
  }

  async closeFilter(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.filterPanel).toBeHidden();
  }

  async captureTableScreenshot(path: string): Promise<void> {
    await this.dataTable.screenshot({ path });
  }
}
