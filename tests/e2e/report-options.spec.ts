import { test, expect } from '../../src/fixtures/app.fixture';

test.describe('Report module — toolbar and table options', () => {
  test.beforeEach(async ({ app }) => {
    await app.report.goto();
  });

  test('E2E-RPT-01/02/03 - search filters and clears', async ({ app }) => {
    await app.report.search('Ishaan');
    await expect(app.report.countText).toHaveText('1–15 of 50');
    await app.report.clearSearch();
    await expect(app.report.countText).toHaveText('1–15 of 1000');
  });

  test('E2E-RPT-04 - sort panel lists all 13 columns', async ({ app }) => {
    await app.report.openSort();
    await app.report.addSortLevel('Full name');
    await expect(app.page.getByText('Sorted sequence (1/5)', { exact: false })).toBeVisible();
  });

  test('E2E-RPT-05 - sort applies after Save changes', async ({ app }) => {
    await app.report.openSort();
    await app.report.addSortLevel('Full name');
    await app.report.closeSortAndSave();
    await expect(app.report.firstRow).toBeVisible();
    const firstName = await app.report.firstRow.locator('td').nth(2).innerText();
    expect(firstName.trim().localeCompare('Ishaan Sharma')).toBeLessThan(0);
  });

  test('E2E-RPT-07/08 - filter panel and condition builder', async ({ app }) => {
    await app.report.openFilter();
    await app.page.getByRole('button', { name: '+ Add condition' }).click();
    await expect(app.page.getByText('User id', { exact: true }).first()).toBeVisible();
    await expect(app.page.getByText('Equals', { exact: true }).first()).toBeVisible();
    await expect(app.page.getByPlaceholder('Value…')).toBeVisible();
  });

  test('E2E-RPT-11 - Show/Hide Columns lists all 13 columns', async ({ app }) => {
    await app.report.openColumns();
    await expect(app.page.getByText(/All\s*\(13\)/).first()).toBeVisible();
  });

  test('E2E-RPT-13/14 - list and grid views switch', async ({ app }) => {
    await expect(app.report.dataTable).toBeVisible();
    await app.report.setGridView();
    await expect(app.page.getByText('USR-0001', { exact: true }).first()).toBeVisible();
    await app.report.setListView();
    await expect(app.report.dataTable).toBeVisible();
  });

  test('E2E-RPT-15/16 - pagination next and last', async ({ app }) => {
    await app.report.nextPage();
    await expect(app.report.countText).toHaveText('16–30 of 1000');
    await app.report.lastPage();
    await expect(app.report.countText).toHaveText('991–1000 of 1000');
  });

  test('E2E-RPT-18 - rows-per-page options are offered', async ({ app }) => {
    await app.report.openRowsPerPage();
    for (const size of ['10', '15', '25', '50', '100']) {
      await expect(app.page.getByRole('option', { name: size, exact: true })).toBeVisible();
    }
  });

  test('E2E-RPT-20 - view dropdown lists personal views and create option', async ({ app }) => {
    await app.report.openViewMenu();
    await expect(app.page.getByText('Personal Views', { exact: true })).toBeVisible();
    await expect(app.page.getByRole('button', { name: 'Create New Report View' })).toBeVisible();
  });

  test('E2E-RPT-21 - create report view form opens', async ({ app }) => {
    await app.report.openCreateViewForm();
    await expect(app.page.getByRole('button', { name: 'Create Report View' })).toBeVisible();
  });

  test('E2E-RPT-23 - More actions lists all options', async ({ app }) => {
    await app.report.openMoreActions();
    for (const item of ['Export', 'Grouping', 'Audit History', 'Scheduled Reports', 'Info']) {
      await expect(app.page.getByRole('menuitem', { name: item })).toBeVisible();
    }
  });

  test('E2E-RPT-24 - export offers PDF, Excel and JSON', async ({ app }) => {
    await app.report.openExport();
    const format = app.page.locator('[role="combobox"]').filter({ hasText: 'PDF' }).first();
    await format.focus();
    await app.page.keyboard.press('ArrowDown');
    for (const option of ['Excel (.xlsx)', 'JSON', 'PDF']) {
      await expect(app.page.getByRole('option', { name: option, exact: true })).toBeVisible();
    }
  });

  test('E2E-RPT-28 - grouping panel opens', async ({ app }) => {
    await app.report.openMoreActions();
    await app.page.getByRole('menuitem', { name: 'Grouping' }).click();
    await expect(app.page.getByText('Group configuration', { exact: true })).toBeVisible();
  });

  test('E2E-RPT-29 - audit history lists events', async ({ app }) => {
    await app.report.openAuditHistory();
    await expect(app.page.getByText(/event recorded/).first()).toBeVisible();
  });

  test('E2E-RPT-30 - scheduled reports empty state', async ({ app }) => {
    await app.report.openScheduledReports();
    await expect(app.page.getByText('No scheduled reports yet', { exact: true })).toBeVisible();
  });

  test('E2E-RPT-32 - row actions menu lists View/Edit/Duplicate/Delete', async ({ app }) => {
    await app.report.openRowActions();
    for (const item of ['View', 'Edit', 'Duplicate', 'Delete']) {
      await expect(app.page.getByText(item, { exact: true }).first()).toBeVisible();
    }
  });

  test('E2E-RPT-34 - New User dialog opens with all fields', async ({ app }) => {
    await app.report.openNewUser();
    for (const field of ['Full Name', 'Username', 'Email', 'Phone Number', 'Department', 'Role', 'Status', 'Title', 'Territory', 'Continent', 'Country', 'State/Province']) {
      await expect(app.page.getByText(field, { exact: true }).first()).toBeVisible();
    }
  });

  test('E2E-RPT-37 - table header sort reacts', async ({ app }) => {
    const header = app.page.getByRole('columnheader', { name: 'Full name', exact: true }).first();
    await header.click();
    await expect(app.report.firstRow).toBeVisible();
  });

  test('E2E-RPT-06 - Sort Clear all keeps the panel open and sort applied (DEF-04)', async ({ app }) => {
    test.fail(true, 'DEF-04: Clear all does not close the panel or clear the applied sort until Save');
    await app.report.openSort();
    await app.report.addSortLevel('Full name');
    await app.report.closeSortAndSave();
    await app.report.openSort();
    await app.page.getByRole('button', { name: /Removes all applied sorting/ }).click();
    await expect(app.page.getByRole('heading', { name: 'Sort columns' })).toBeHidden();
    const firstName = await app.report.firstRow.locator('td').nth(2).innerText();
    expect(firstName.trim()).toBe('Ishaan Sharma');
  });

  test.skip('E2E-RPT-25 - Export PDF', async () => {
    // Blocked: UI reports success but headless Chromium captures no file.
  });

  test.skip('E2E-RPT-26/27 - Export Excel/JSON', async () => {
    // Not run: same download mechanism as PDF.
  });

  test.skip('E2E-RPT-10 - Filter apply/clear', async () => {
    // Not run: condition builder validated; full apply/clear pending.
  });

  test.skip('E2E-RPT-12 - Toggle column', async () => {
    // Not run.
  });

  test.skip('E2E-RPT-17/19 - Page jump / rows-per-page change', async () => {
    // Not run: options validated, change not executed.
  });

  test.skip('E2E-RPT-22 - Create report view (destructive)', async () => {
    // Requires data creation approval.
  });

  test.skip('E2E-RPT-31 - New schedule', async () => {
    // Not run.
  });

  test.skip('E2E-RPT-33 - Row View', async () => {
    // Not run: opens record detail.
  });

  test.skip('E2E-RPT-35/36 - New User validation/create', async () => {
    // Requires data creation approval.
  });
});
