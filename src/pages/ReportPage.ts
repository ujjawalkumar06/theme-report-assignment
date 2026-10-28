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
  get countText(): Locator {
    return this.page.getByText(/\d+–\d+ of [\d,]+/).first();
  }

  get sortButton(): Locator {
    return this.page.getByRole('button', { name: 'Sort', exact: true });
  }

  get columnsButton(): Locator {
    return this.page.getByRole('button', { name: 'Show/Hide Columns', exact: true });
  }

  get listViewButton(): Locator {
    return this.page.getByRole('button', { name: 'List view', exact: true });
  }

  get gridViewButton(): Locator {
    return this.page.getByRole('button', { name: 'Grid view', exact: true });
  }

  get moreActionsButton(): Locator {
    return this.page.getByRole('button', { name: 'More actions', exact: true });
  }

  get viewButton(): Locator {
    return this.page.getByRole('button', { name: /^View: / });
  }

  async search(term: string): Promise<void> {
    await this.searchButton.click();
    const input = this.page.locator('input[placeholder="Search data..."]');
    await input.fill(term);
    await input.press('Enter');
    await expect(this.countText).not.toHaveText(/of 1000/);
  }

  async clearSearch(): Promise<void> {
    const input = this.page.locator('input[placeholder="Search data..."]');
    await input.fill('');
    await input.press('Enter');
    await expect(this.countText).toHaveText(/of 1000/);
  }

  async openSort(): Promise<void> {
    await this.sortButton.click();
    await expect(this.page.getByRole('heading', { name: 'Sort columns' })).toBeVisible();
  }

  async addSortLevel(column: string): Promise<void> {
    const selector = this.page.getByRole('combobox').nth(1);
    await selector.click();
    await this.page.getByRole('option', { name: column, exact: true }).click();
    await expect(this.page.getByText('Sorted sequence', { exact: false })).toBeVisible();
  }

  async closeSortAndSave(): Promise<void> {
    await this.page.getByRole('button', { name: 'Close', exact: true }).last().click();
    const save = this.page.getByRole('button', { name: 'Save changes' });
    if (await save.isVisible().catch(() => false)) await save.click();
  }

  async openColumns(): Promise<void> {
    await this.columnsButton.click();
    await expect(this.page.getByText(/All\s*\(13\)/).first()).toBeVisible();
  }

  async setGridView(): Promise<void> {
    await this.gridViewButton.click();
    await expect(this.page.locator('main table')).toHaveCount(0);
  }

  async setListView(): Promise<void> {
    await this.listViewButton.click();
    await expect(this.dataTable).toBeVisible();
  }

  async nextPage(): Promise<void> {
    await this.page.locator('button[title="Next page"]').click();
  }

  async firstPage(): Promise<void> {
    await this.page.locator('button[title="First page"]').click();
  }

  async lastPage(): Promise<void> {
    await this.page.locator('button[title="Last page"]').click();
  }

  async openRowsPerPage(): Promise<void> {
    await this.page.getByText('Rows per page').locator('..').getByRole('combobox').click();
    await expect(this.page.getByRole('option', { name: '10', exact: true })).toBeVisible();
  }

  async openViewMenu(): Promise<void> {
    await this.viewButton.click();
    await expect(this.page.getByText('Personal Views', { exact: true })).toBeVisible();
  }

  async openCreateViewForm(): Promise<void> {
    await this.openViewMenu();
    await this.page.getByRole('button', { name: 'Create New Report View' }).click();
    await expect(this.page.getByRole('button', { name: 'Create Report View' })).toBeVisible();
  }

  async openMoreActions(): Promise<void> {
    await this.moreActionsButton.click();
    await expect(this.page.getByRole('menuitem', { name: 'Export' })).toBeVisible();
  }

  async openExport(): Promise<void> {
    await this.openMoreActions();
    await this.page.getByRole('menuitem', { name: 'Export' }).click();
    await expect(this.page.getByText('Export Report', { exact: true })).toBeVisible();
  }

  async openAuditHistory(): Promise<void> {
    await this.openMoreActions();
    await this.page.getByRole('menuitem', { name: 'Audit History' }).click();
    await expect(this.page.getByText(/Audit History/).first()).toBeVisible();
  }

  async openScheduledReports(): Promise<void> {
    await this.openMoreActions();
    await this.page.getByRole('menuitem', { name: 'Scheduled Reports' }).click();
    await expect(this.page.getByText('No schedules yet', { exact: true })).toBeVisible();
  }

  async openNewUser(): Promise<void> {
    await this.page.getByRole('button', { name: 'New User' }).click();
    await expect(this.page.getByText('Add User Details', { exact: true })).toBeVisible();
  }

  async openRowActions(): Promise<void> {
    const button = this.firstRow.locator('td:last-child button').first();
    await button.evaluate((element) => (element as HTMLElement).click());
    await expect(this.page.getByText('Duplicate', { exact: true }).first()).toBeVisible();
  }

  async sortByHeader(name: string): Promise<void> {
    await this.page.getByRole('columnheader', { name, exact: true }).click();
  }

  async resetToDefaultView(): Promise<void> {
    await this.page.reload();
    await this.expectLoaded();
  }
}
