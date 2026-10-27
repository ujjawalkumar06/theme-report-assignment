import { test, expect } from '../src/fixtures/app.fixture';
import type { App } from '../src/fixtures/app.fixture';
import { MODE_TOKENS, PRESETS, PRIMARY_THEME, type ThemeMode } from '../src/config/themes';
import {
  assertThemeApplied,
  breakThemePersistence,
  readThemeSnapshot,
  seedUnsupportedMode,
  seedUnsupportedPreset,
} from '../src/utils/theme';
import { colorsEquivalent, contrastBetween, normalizeColor } from '../src/utils/color';

async function applyBaseTheme(app: App): Promise<void> {
  await app.themeStudio.applyTheme(PRIMARY_THEME.preset, PRIMARY_THEME.mode);
  await app.themeStudio.close('report');
  await app.report.expectLoaded();
}

test.describe('Theme negative & edge cases', () => {
  test('EDGE-01 - first visit without stored preferences renders a consistent theme', async ({ app }) => {
    await app.report.goto();

    const snapshot = await readThemeSnapshot(app.page);
    expect(snapshot.mode, 'A concrete mode should always be exposed').toMatch(/^(light|dark)$/);
    const tokens = MODE_TOKENS[snapshot.mode as ThemeMode];
    expect(normalizeColor(snapshot.pageBg), 'Page background token should match the active mode').toBe(
      normalizeColor(tokens.pageBg),
    );
    expect(
      colorsEquivalent(snapshot.bodyBg, tokens.pageBg),
      `Body background (${snapshot.bodyBg}) should follow the page background (${tokens.pageBg})`,
    ).toBe(true);
    await expect(app.report.firstRow, 'Report data should render on first visit').toBeVisible();
  });

  test('TH-08a - an unsupported persisted preset does not break the Report Module', async ({ app }) => {
    await applyBaseTheme(app);
    await seedUnsupportedPreset(app.page);
    await app.page.reload();
    await app.report.expectLoaded();

    const snapshot = await readThemeSnapshot(app.page);
    expect(snapshot.mode, 'Unsupported preset should not destabilise the mode').toMatch(/^(light|dark)$/);
    const tokens = MODE_TOKENS[snapshot.mode as ThemeMode];
    expect(normalizeColor(snapshot.pageBg), 'Page background should stay consistent').toBe(
      normalizeColor(tokens.pageBg),
    );
    expect(
      colorsEquivalent(snapshot.bodyBg, tokens.pageBg),
      `Body background (${snapshot.bodyBg}) should match the page background (${tokens.pageBg})`,
    ).toBe(true);
    expect(snapshot.primary, 'A resolved accent colour should still be exposed').toBeTruthy();

    await expect(app.report.firstRow, 'Report should remain usable after an unsupported preset').toBeVisible();
    await expect(app.report.filterButton, 'Report controls should remain usable').toBeEnabled();
  });

  test('DEF-02 - accent text must meet WCAG AA contrast in light mode', async ({ app }, testInfo) => {
    test.fail(
      true,
      'DEF-02 (docs/defect-report.md): Emerald light uses the raw accent (#10B981) for the Report ' +
        'breadcrumb and the filter dialog heading, giving ~2.5:1 contrast on white (WCAG AA needs 4.5:1).',
    );

    await app.themeStudio.applyTheme(PRESETS.emerald, 'light');
    await app.themeStudio.close('report');
    await app.report.expectLoaded();
    const snapshot = await assertThemeApplied(app.page, PRESETS.emerald, 'light');

    const breadcrumbColor = await app.page
      .getByRole('heading', { name: 'Reports', exact: true })
      .first()
      .evaluate((element) => getComputedStyle(element).color);
    const breadcrumbContrast = contrastBetween(breadcrumbColor, snapshot.pageBg);

    await app.report.openFilter();
    const filterHeadingColor = await app.page
      .getByText('Filter columns', { exact: true })
      .evaluate((element) => getComputedStyle(element).color);
    const filterHeadingContrast = contrastBetween(filterHeadingColor, snapshot.cardBg);

    await testInfo.attach('emerald-light-contrast', {
      body: await app.page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await testInfo.attach('contrast-measurements', {
      body: JSON.stringify(
        {
          reportBreadcrumb: { color: breadcrumbColor, background: snapshot.pageBg, ratio: breadcrumbContrast },
          filterHeading: { color: filterHeadingColor, background: snapshot.cardBg, ratio: filterHeadingContrast },
        },
        null,
        2,
      ),
      contentType: 'application/json',
    });

    expect(breadcrumbContrast!, 'DEF-02: Report breadcrumb should reach 4.5:1').toBeGreaterThanOrEqual(4.5);
    expect(filterHeadingContrast!, 'DEF-02: Filter dialog heading should reach 4.5:1').toBeGreaterThanOrEqual(4.5);
  });

  test('DEF-03 - an unsupported persisted mode must not blank the application', async ({ app }, testInfo) => {
    test.fail(
      true,
      'DEF-03 (docs/defect-report.md): a persisted mode outside light|dark crashes hydration with ' +
        '"Cannot read properties of undefined (reading \'disabled\')" and renders a blank screen until storage is cleared.',
    );

    await applyBaseTheme(app);

    const pageErrors: string[] = [];
    app.page.on('pageerror', (error) => pageErrors.push(error.message));

    await seedUnsupportedMode(app.page);
    await app.page.reload();
    await app.page.waitForSelector('main', { timeout: 8_000 }).catch(() => undefined);

    const state = await app.page.evaluate(() => ({
      rootChildren: document.getElementById('root')?.children.length ?? -1,
      hasMain: Boolean(document.querySelector('main')),
      mode: document.documentElement.getAttribute('data-theme-mode'),
      bodyText: document.body.innerText.slice(0, 300),
    }));

    await testInfo.attach('unsupported-mode-screen', {
      body: await app.page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await testInfo.attach('unsupported-mode-state', {
      body: JSON.stringify({ state, pageErrors }, null, 2),
      contentType: 'application/json',
    });

    expect(state.rootChildren, 'DEF-03: the application should render a fallback, not an empty root').toBeGreaterThan(
      0,
    );
    expect(state.hasMain, 'DEF-03: the Report Module should remain reachable').toBe(true);
    expect(pageErrors, 'DEF-03: no uncaught render error should occur').toEqual([]);
  });

  test(
    'TH-08b - a failed preference write must not leave the session and storage out of sync (DEF-01)',
    async ({ app }, testInfo) => {
      test.fail(
        true,
        'DEF-01 (docs/defect-report.md): theme is applied in memory but not persisted; the failure is ' +
          'silent (no user-visible feedback) and the theme reverts on reload.',
      );

      await applyBaseTheme(app);
      const before = await readThemeSnapshot(app.page);
      expect(before.mode).toBe('dark');

      const consoleErrors: string[] = [];
      app.page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });

      await breakThemePersistence(app.page);
      await app.page.getByRole('button', { name: /Switch to (Light|Dark) Mode/ }).click();

      const after = await readThemeSnapshot(app.page);
      await testInfo.attach('failed-persistence-ui', {
        body: await app.page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
      await testInfo.attach('failed-persistence-console', {
        body: consoleErrors.join('\n') || '(no console errors captured)',
        contentType: 'text/plain',
      });

      expect(
        after.mode,
        'DEF-01: the UI should not apply a preference that could not be persisted, or the failure must be surfaced',
      ).toBe(before.mode);
      expect(after.storedMode, 'DEF-01: persisted mode should reflect the mode shown in the UI').toBe(after.mode);
    },
  );
});
