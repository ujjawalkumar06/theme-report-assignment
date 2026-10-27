# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: theme-edge.spec.ts >> Theme negative & edge cases >> DEF-03 - an unsupported persisted mode must not blank the application
- Location: tests/theme-edge.spec.ts:106:7

# Error details

```
Error: DEF-03: the application should render a fallback, not an empty root

expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Test source

```ts
  42  |     const snapshot = await readThemeSnapshot(app.page);
  43  |     expect(snapshot.mode, 'Unsupported preset should not destabilise the mode').toMatch(/^(light|dark)$/);
  44  |     const tokens = MODE_TOKENS[snapshot.mode as ThemeMode];
  45  |     expect(normalizeColor(snapshot.pageBg), 'Page background should stay consistent').toBe(
  46  |       normalizeColor(tokens.pageBg),
  47  |     );
  48  |     expect(
  49  |       colorsEquivalent(snapshot.bodyBg, tokens.pageBg),
  50  |       `Body background (${snapshot.bodyBg}) should match the page background (${tokens.pageBg})`,
  51  |     ).toBe(true);
  52  |     expect(snapshot.primary, 'A resolved accent colour should still be exposed').toBeTruthy();
  53  | 
  54  |     await expect(app.report.firstRow, 'Report should remain usable after an unsupported preset').toBeVisible();
  55  |     await expect(app.report.filterButton, 'Report controls should remain usable').toBeEnabled();
  56  |   });
  57  | 
  58  |   test('DEF-02 - accent text must meet WCAG AA contrast in light mode', async ({ app }, testInfo) => {
  59  |     test.fail(
  60  |       true,
  61  |       'DEF-02 (docs/defect-report.md): Emerald light uses the raw accent (#10B981) for the Report ' +
  62  |         'breadcrumb and the filter dialog heading, giving ~2.5:1 contrast on white (WCAG AA needs 4.5:1).',
  63  |     );
  64  |     testInfo.annotations.push({
  65  |       type: 'known defect',
  66  |       description: 'DEF-02 — Emerald light accent text ≈2.54:1 (WCAG AA requires 4.5:1)',
  67  |     });
  68  | 
  69  |     await app.themeStudio.applyTheme(PRESETS.emerald, 'light');
  70  |     await app.themeStudio.close('report');
  71  |     await app.report.expectLoaded();
  72  |     const snapshot = await assertThemeApplied(app.page, PRESETS.emerald, 'light');
  73  | 
  74  |     const breadcrumbColor = await app.page
  75  |       .getByRole('heading', { name: 'Reports', exact: true })
  76  |       .first()
  77  |       .evaluate((element) => getComputedStyle(element).color);
  78  |     const breadcrumbContrast = contrastBetween(breadcrumbColor, snapshot.pageBg);
  79  | 
  80  |     await app.report.openFilter();
  81  |     const filterHeadingColor = await app.page
  82  |       .getByText('Filter columns', { exact: true })
  83  |       .evaluate((element) => getComputedStyle(element).color);
  84  |     const filterHeadingContrast = contrastBetween(filterHeadingColor, snapshot.cardBg);
  85  | 
  86  |     await testInfo.attach('emerald-light-contrast', {
  87  |       body: await app.page.screenshot({ fullPage: true }),
  88  |       contentType: 'image/png',
  89  |     });
  90  |     await testInfo.attach('contrast-measurements', {
  91  |       body: JSON.stringify(
  92  |         {
  93  |           reportBreadcrumb: { color: breadcrumbColor, background: snapshot.pageBg, ratio: breadcrumbContrast },
  94  |           filterHeading: { color: filterHeadingColor, background: snapshot.cardBg, ratio: filterHeadingContrast },
  95  |         },
  96  |         null,
  97  |         2,
  98  |       ),
  99  |       contentType: 'application/json',
  100 |     });
  101 | 
  102 |     expect(breadcrumbContrast!, 'DEF-02: Report breadcrumb should reach 4.5:1').toBeGreaterThanOrEqual(4.5);
  103 |     expect(filterHeadingContrast!, 'DEF-02: Filter dialog heading should reach 4.5:1').toBeGreaterThanOrEqual(4.5);
  104 |   });
  105 | 
  106 |   test('DEF-03 - an unsupported persisted mode must not blank the application', async ({ app }, testInfo) => {
  107 |     test.fail(
  108 |       true,
  109 |       'DEF-03 (docs/defect-report.md): a persisted mode outside light|dark crashes hydration with ' +
  110 |         '"Cannot read properties of undefined (reading \'disabled\')" and renders a blank screen until storage is cleared.',
  111 |     );
  112 |     testInfo.annotations.push({
  113 |       type: 'known defect',
  114 |       description: 'DEF-03 — unsupported persisted mode crashes hydration and blanks the app',
  115 |     });
  116 | 
  117 |     await applyBaseTheme(app);
  118 | 
  119 |     const pageErrors: string[] = [];
  120 |     app.page.on('pageerror', (error) => pageErrors.push(error.message));
  121 | 
  122 |     await seedUnsupportedMode(app.page);
  123 |     await app.page.reload();
  124 |     await app.page.waitForSelector('main', { timeout: 8_000 }).catch(() => undefined);
  125 | 
  126 |     const state = await app.page.evaluate(() => ({
  127 |       rootChildren: document.getElementById('root')?.children.length ?? -1,
  128 |       hasMain: Boolean(document.querySelector('main')),
  129 |       mode: document.documentElement.getAttribute('data-theme-mode'),
  130 |       bodyText: document.body.innerText.slice(0, 300),
  131 |     }));
  132 | 
  133 |     await testInfo.attach('unsupported-mode-screen', {
  134 |       body: await app.page.screenshot({ fullPage: true }),
  135 |       contentType: 'image/png',
  136 |     });
  137 |     await testInfo.attach('unsupported-mode-state', {
  138 |       body: JSON.stringify({ state, pageErrors }, null, 2),
  139 |       contentType: 'application/json',
  140 |     });
  141 | 
> 142 |     expect(state.rootChildren, 'DEF-03: the application should render a fallback, not an empty root').toBeGreaterThan(
      |                                                                                                       ^ Error: DEF-03: the application should render a fallback, not an empty root
  143 |       0,
  144 |     );
  145 |     expect(state.hasMain, 'DEF-03: the Report Module should remain reachable').toBe(true);
  146 |     expect(pageErrors, 'DEF-03: no uncaught render error should occur').toEqual([]);
  147 |   });
  148 | 
  149 |   test(
  150 |     'TH-08b - a failed preference write must not leave the session and storage out of sync (DEF-01)',
  151 |     async ({ app }, testInfo) => {
  152 |       test.fail(
  153 |         true,
  154 |         'DEF-01 (docs/defect-report.md): theme is applied in memory but not persisted; the failure is ' +
  155 |           'silent (no user-visible feedback) and the theme reverts on reload.',
  156 |       );
  157 |       testInfo.annotations.push({
  158 |         type: 'known defect',
  159 |         description: 'DEF-01 — failed preference write silently diverges UI and storage',
  160 |       });
  161 | 
  162 |       await applyBaseTheme(app);
  163 |       const before = await readThemeSnapshot(app.page);
  164 |       expect(before.mode).toBe('dark');
  165 | 
  166 |       const consoleErrors: string[] = [];
  167 |       app.page.on('console', (message) => {
  168 |         if (message.type() === 'error') consoleErrors.push(message.text());
  169 |       });
  170 | 
  171 |       await breakThemePersistence(app.page);
  172 |       await app.page.getByRole('button', { name: /Switch to (Light|Dark) Mode/ }).click();
  173 | 
  174 |       const after = await readThemeSnapshot(app.page);
  175 |       await testInfo.attach('failed-persistence-ui', {
  176 |         body: await app.page.screenshot({ fullPage: true }),
  177 |         contentType: 'image/png',
  178 |       });
  179 |       await testInfo.attach('failed-persistence-console', {
  180 |         body: consoleErrors.join('\n') || '(no console errors captured)',
  181 |         contentType: 'text/plain',
  182 |       });
  183 | 
  184 |       expect(
  185 |         after.mode,
  186 |         'DEF-01: the UI should not apply a preference that could not be persisted, or the failure must be surfaced',
  187 |       ).toBe(before.mode);
  188 |       expect(after.storedMode, 'DEF-01: persisted mode should reflect the mode shown in the UI').toBe(after.mode);
  189 |     },
  190 |   );
  191 | });
  192 | 
```