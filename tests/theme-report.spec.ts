import { test, expect, signIn } from '../src/fixtures/app.fixture';
import type { App } from '../src/fixtures/app.fixture';
import { MODE_TOKENS, PRESETS, PRIMARY_THEME, SECONDARY_THEME, type ThemeMode } from '../src/config/themes';
import { ReportPage } from '../src/pages/ReportPage';
import {
  assertThemeApplied,
  expectSameTheme,
  fingerprint,
  readThemeSnapshot,
} from '../src/utils/theme';
import {
  colorsEquivalent,
  composite,
  contrastBetween,
  contrastRatio,
  normalizeColor,
  parseColor,
} from '../src/utils/color';

async function applyBaseTheme(app: App, returnTo: 'dashboard' | 'report' = 'report'): Promise<void> {
  await app.themeStudio.applyTheme(PRIMARY_THEME.preset, PRIMARY_THEME.mode);
  await app.themeStudio.close(returnTo);
  if (returnTo === 'dashboard') {
    await app.dashboard.expectLoaded();
  } else {
    await app.report.expectLoaded();
  }
}

test.describe('Theme update & Report Module validation', () => {
  test('TH-01 - changing the theme from the Dashboard applies it immediately', async ({ app }) => {
    const preset = PRESETS.indigo;
    const mode: ThemeMode = 'light';

    await app.themeStudio.applyTheme(preset, mode);
    await app.themeStudio.close('dashboard');
    await app.dashboard.expectLoaded();

    const snapshot = await assertThemeApplied(app.page, preset, mode);
    expect(snapshot.mode).toBe(MODE_TOKENS[mode].attr);
    expect(normalizeColor(snapshot.pageBg)).toBe(normalizeColor(MODE_TOKENS[mode].pageBg));
  });

  test('TH-02 - Report Module reflects the theme selected on the Dashboard', async ({ app }) => {
    await applyBaseTheme(app, 'dashboard');
    const dashboardTheme = fingerprint(await readThemeSnapshot(app.page));

    await app.dashboard.openReports();
    await app.report.expectLoaded();

    const reportSnapshot = await assertThemeApplied(app.page, PRIMARY_THEME.preset, PRIMARY_THEME.mode);
    expectSameTheme(fingerprint(reportSnapshot), dashboardTheme, 'Dashboard -> Report');

    const headerCell = app.page.locator('main table th').first();
    await expect(headerCell, 'Report table header should be visible').toBeVisible();
    const headerBackground = await headerCell.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(headerBackground, 'Report table header should use a themed surface, not a transparent default').not.toBe(
      'rgba(0, 0, 0, 0)',
    );

    const bodyBackground = await app.page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(
      colorsEquivalent(bodyBackground, reportSnapshot.pageBg),
      `Report page background (${bodyBackground}) should match --page-bg (${reportSnapshot.pageBg})`,
    ).toBe(true);
  });

  test('TH-03 - Report Module keeps the theme after a refresh', async ({ app }) => {
    await applyBaseTheme(app, 'report');
    const before = await readThemeSnapshot(app.page);

    await app.page.reload();
    await app.report.expectLoaded();

    const after = await assertThemeApplied(app.page, PRIMARY_THEME.preset, PRIMARY_THEME.mode);
    expectSameTheme(fingerprint(after), fingerprint(before), 'Report refresh');
  });

  test('TH-04 - theme stays consistent across Dashboard and Report navigation', async ({ app }) => {
    await applyBaseTheme(app, 'dashboard');
    const baseline = fingerprint(await readThemeSnapshot(app.page));

    // Dashboard -> Report
    await app.dashboard.openReports();
    await app.report.expectLoaded();
    const onReport = fingerprint(await assertThemeApplied(app.page, PRIMARY_THEME.preset, PRIMARY_THEME.mode));
    expectSameTheme(onReport, baseline, 'Dashboard -> Report');

    // Report -> Dashboard
    await app.report.ensureSidebarExpanded();
    await app.report.dashboardNav.click();
    await app.dashboard.expectLoaded();
    const backOnDashboard = fingerprint(
      await assertThemeApplied(app.page, PRIMARY_THEME.preset, PRIMARY_THEME.mode),
    );
    expectSameTheme(backOnDashboard, baseline, 'Report -> Dashboard');
  });

  test('TH-05 - selecting a second theme replaces the previous selection in the Report Module', async ({ app }) => {
    await applyBaseTheme(app, 'report');
    const first = await readThemeSnapshot(app.page);
    expect(first.presetId).toBe(PRIMARY_THEME.preset.key);

    await app.themeStudio.applyTheme(SECONDARY_THEME.preset, SECONDARY_THEME.mode);
    await app.themeStudio.close('report');
    await app.report.expectLoaded();

    const second = await assertThemeApplied(app.page, SECONDARY_THEME.preset, SECONDARY_THEME.mode);
    expect(second.presetId).toBe(SECONDARY_THEME.preset.key);
    expect(normalizeColor(second.primary), 'Theme accent should change to the latest preset').toBe(
      normalizeColor(SECONDARY_THEME.preset.resolved[SECONDARY_THEME.mode].primary),
    );
  });

  test('TH-06 - a new tab opened after the change applies the persisted theme', async ({ app }) => {
    await applyBaseTheme(app, 'report');

    const secondPage = await app.page.context().newPage();
    try {
      // Authentication lives in sessionStorage, which is tab-scoped, so the new tab signs in again.
      await signIn(secondPage);

      const report = new ReportPage(secondPage);
      await report.goto();

      await assertThemeApplied(secondPage, PRIMARY_THEME.preset, PRIMARY_THEME.mode);
    } finally {
      await secondPage.close();
    }
  });

  test('TH-07 - Report Module surfaces, text and controls stay readable and themed', async ({ app }) => {
    const scenarios: Array<{ preset: (typeof PRESETS)[string]; mode: ThemeMode }> = [
      { preset: PRESETS.corporate, mode: 'dark' },
      { preset: PRESETS.emerald, mode: 'light' },
    ];

    for (const scenario of scenarios) {
      await app.themeStudio.applyTheme(scenario.preset, scenario.mode);
      await app.themeStudio.close('report');
      await app.report.expectLoaded();
      const snapshot = await assertThemeApplied(app.page, scenario.preset, scenario.mode);

      // Body/table text must use the resolved theme text colour.
      const bodyCell = app.page.locator('main table').last().locator('tbody tr').first().locator('td').nth(1);
      const cellColor = await bodyCell.evaluate((element) => getComputedStyle(element).color);
      expect(normalizeColor(cellColor), `Table content should use --text-main in ${scenario.mode} mode`).toBe(
        normalizeColor(snapshot.textMain),
      );

      // Header cell: translucent accent over the card surface; text must remain readable.
      const headerCell = app.page.locator('main table th').first();
      const headerStyles = await headerCell.evaluate((element) => {
        const style = getComputedStyle(element);
        return { backgroundColor: style.backgroundColor, color: style.color };
      });
      expect(headerStyles.backgroundColor, 'Table header should not be fully transparent').not.toBe(
        'rgba(0, 0, 0, 0)',
      );
      const headerBg = parseColor(headerStyles.backgroundColor);
      const cardBg = parseColor(snapshot.cardBg);
      if (!headerBg || !cardBg) throw new Error('Unable to parse table header colours');
      const composedHeaderBg = composite(headerBg, cardBg);
      const headerContrast = contrastRatio(parseColor(headerStyles.color)!, composedHeaderBg);
      expect(headerContrast, 'Table header text should meet 4.5:1 contrast').toBeGreaterThanOrEqual(4.5);

      // Key controls should be visible and enabled.
      for (const control of ['Search', 'Filter', 'Sort', 'Show/Hide Columns'] as const) {
        const button = app.page.getByRole('button', { name: control, exact: true });
        await expect(button, `"${control}" control should be visible`).toBeVisible();
        await expect(button, `"${control}" control should be enabled`).toBeEnabled();
      }

      // Filter dialog/panel must follow the theme and keep its primary text readable.
      await app.report.openFilter();
      const panel = app.report.filterPanel;
      const panelColor = await panel.evaluate((element) => getComputedStyle(element).color);
      expect(normalizeColor(panelColor), 'Filter panel text should use the theme text colour').toBe(
        normalizeColor(snapshot.textMain),
      );
      const headingColor = await app.page
        .getByText('Filter columns', { exact: true })
        .evaluate((element) => getComputedStyle(element).color);
      const headingContrast = contrastBetween(headingColor, snapshot.cardBg);
      expect(
        headingContrast,
        `Filter panel heading colour (${headingColor}) should be resolvable against the card surface`,
      ).not.toBeNull();
      await app.report.closeFilter();

      // Controls that are not theme text must still be visible and usable.
      await expect(app.report.firstRow, 'Report data should remain visible').toBeVisible();
    }
  });
});
