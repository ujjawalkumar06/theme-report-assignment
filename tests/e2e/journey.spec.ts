import { test, expect } from '../../src/fixtures/app.fixture';
import { PRESETS } from '../../src/config/themes';
import { assertThemeApplied } from '../../src/utils/theme';

test('E2E-FLOW-01 - full journey: login → theme → report → search → pagination → grid → export → reset', async ({
  app,
}) => {
  // Theme from the dashboard
  await app.themeStudio.applyTheme(PRESETS.corporate, 'dark');
  await app.themeStudio.close('dashboard');
  await app.dashboard.expectLoaded();
  await assertThemeApplied(app.page, PRESETS.corporate, 'dark');

  // Report
  await app.dashboard.openReports();
  await app.report.expectLoaded();
  await assertThemeApplied(app.page, PRESETS.corporate, 'dark');

  // Search
  await app.report.search('Ishaan');
  await expect(app.report.countText).toHaveText('1–15 of 50');
  await app.report.clearSearch();
  await expect(app.report.countText).toHaveText('1–15 of 1000');

  // Pagination
  await app.report.nextPage();
  await expect(app.report.countText).toHaveText('16–30 of 1000');
  await app.report.firstPage();
  await expect(app.report.countText).toHaveText('1–15 of 1000');

  // Grid and back
  await app.report.setGridView();
  await app.report.setListView();
  await expect(app.report.dataTable).toBeVisible();

  // Export dialog (download itself is blocked in headless Chromium)
  await app.report.openExport();
  await expect(app.page.getByText('Export Report', { exact: true })).toBeVisible();
  await app.page.getByRole('button', { name: 'Cancel', exact: true }).last().click();

  // Reset theme
  await app.themeStudio.open();
  await app.themeStudio.resetToDefaults();
  await app.themeStudio.close('report');
  await app.report.expectLoaded();
  await assertThemeApplied(app.page, PRESETS.emerald, 'light');
});
