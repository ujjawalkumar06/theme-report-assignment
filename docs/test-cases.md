# Test scenarios and test cases

**Legend:** ✅ passing · ⚠️ expected failure (defect reproduced, marked with Playwright `test.fail`) · ❌ failing (not expected)

| ID | Scenario | Type | Automated | Result |
|---|---|---|---|---|
| TH-01 | Change theme from Dashboard | Functional / positive | `tests/theme-report.spec.ts` | ✅ |
| TH-02 | Open Report Module after changing theme | Functional / cross-module | `tests/theme-report.spec.ts` | ✅ |
| TH-03 | Refresh Report Module | Persistence | `tests/theme-report.spec.ts` | ✅ |
| TH-04 | Navigate Dashboard → Report → Dashboard | Persistence / navigation | `tests/theme-report.spec.ts` | ✅ |
| TH-05 | Change theme again and reopen Report Module | Functional / latest-wins | `tests/theme-report.spec.ts` | ✅ |
| TH-06 | Open Report Module in a new tab after the change | Persistence / session scope | `tests/theme-report.spec.ts` | ✅ |
| TH-07 | Inspect key Report Module UI elements | Readability / consistency | `tests/theme-report.spec.ts` | ✅ |
| TH-08a | Unsupported persisted preset | Negative | `tests/theme-edge.spec.ts` | ✅ |
| TH-08b | Failed preference update | Negative / fault injection | `tests/theme-edge.spec.ts` | ⚠️ DEF-01 |
| TH-08c | Unsupported persisted mode | Negative / fault injection | `tests/theme-edge.spec.ts` | ⚠️ DEF-03 |
| EDGE-01 | First visit with no stored preferences | Baseline | `tests/theme-edge.spec.ts` | ✅ |
| ACC-01 | Accent text contrast in light mode | Accessibility | `tests/theme-edge.spec.ts` | ⚠️ DEF-02 |

---

## TH-01 — Change theme from Dashboard

**Preconditions:** signed in, Dashboard open, default theme.
**Steps:**
1. Sidebar → Theme Studio.
2. Expand Theme Settings, select **Indigo Violet**.
3. Set mode **Light**.
4. Leave Theme Studio (navigate to Dashboard).

**Expected:** `data-theme-mode="light"`, `--primary=#A97BFF`, `--page-bg=#ffffff`, `localStorage.settings.presetId="indigo"`, `mode="light"`, Dashboard renders with the new theme.
**Actual:** Pass. Header toggle now offers `Switch to Dark Mode`; stored and resolved values match.

## TH-02 — Report Module reflects the selected theme

**Preconditions:** theme = Corporate Blue / Dark.
**Steps:** capture Dashboard theme fingerprint → sidebar → Report Builder.

**Expected:** Report Module uses the same `data-theme-mode`, `--page-bg`, `--text-main`, `--primary`, `--secondary`, card/border tokens; body background follows `--page-bg`; table header is accent-tinted (not transparent).
**Actual:** Pass. Fingerprints identical across modules.

## TH-03 — Refresh Report Module

**Steps:** open Report with Corporate Blue / Dark → hard reload → assert theme.

**Expected:** theme survives reload; same preset, mode, tokens and body background.
**Actual:** Pass.

## TH-04 — Dashboard → Report → Dashboard

**Steps:** start on Dashboard → click Report Builder → click Dashboard → assert at each step.

**Expected:** no unexpected revert on either module.
**Actual:** Pass. Theme fingerprint stable through both transitions.

## TH-05 — Select a second theme and reopen Report

**Steps:** Corporate Blue / Dark → Report → select **Emerald / Light** → return to Report.

**Expected:** latest selection wins (`presetId="emerald"`, `mode="light"`, `--primary=#10B981`).
**Actual:** Pass.

## TH-06 — New tab after the change

**Steps:** Corporate Blue / Dark → open a new tab → sign in (sessionStorage is tab-scoped) → open Report.

**Expected:** new tab uses the persisted theme (localStorage is shared across tabs of the same origin/profile).
**Actual:** Pass. The new tab requires re-authentication; the theme is already applied on the login screen and after login.

## TH-07 — Key Report Module UI elements

**Steps:** for Corporate Blue / Dark and Emerald / Light:
1. Assert table cell colour equals `--text-main`.
2. Assert table header has a non-transparent accent surface and ≥ 4.5:1 text contrast.
3. Assert Search / Filter / Sort / Show-Hide Columns are visible and enabled.
4. Open the Filter dialog: panel text equals `--text-main`, heading colour resolves against the card surface.

**Expected:** themed surfaces, readable primary text, usable controls, dialog follows the theme.
**Actual:** Pass for the assertions above. A separate accessibility probe (ACC-01) found the accent heading can fall below 4.5:1 in light presets → DEF-02.

## TH-08 — Negative / edge cases

### TH-08a — Unsupported persisted preset (pass)
`presetId="unsupported-preset"`, valid mode, hard reload.
**Expected:** app remains usable with a consistent fallback.
**Actual:** Pass — Report renders, mode and background tokens stay consistent, accent still resolves.

### TH-08b — Failed preference update (DEF-01)
`Storage.prototype.setItem` is replaced with a throwing stub, then the header mode toggle is used.
**Expected:** the failed write is surfaced or the UI does not apply an unsaved preference; UI and storage stay consistent.
**Actual:** ⚠️ UI switches to light, storage remains `dark`; no user feedback; a reload silently reverts. See DEF-01.

### TH-08c — Unsupported persisted mode (DEF-03)
`mode="sepia"`, hard reload.
**Expected:** validate/fallback to a supported mode; app remains usable.
**Actual:** ⚠️ Uncaught `TypeError: Cannot read properties of undefined (reading 'disabled')`; `#root` is empty (blank white screen). See DEF-03.

## EDGE-01 — First visit without stored preferences

**Steps:** fresh context → sign in → open Report without changing theme.
**Expected:** a concrete mode and internally consistent tokens.
**Actual:** Pass. The default theme renders; the storage key is not written until the first change.

## ACC-01 — Accent text contrast (DEF-02)

**Steps:** Emerald / Light → Report → measure breadcrumb colour vs `--page-bg`; open Filter → measure `Filter columns` colour vs `--bg-card`.
**Expected:** ≥ 4.5:1 (WCAG AA normal text).
**Actual:** ⚠️ ≈ 2.54:1 for both. See DEF-02.

---

## Coverage notes

- **Positive paths:** TH-01…TH-07 cover preset change, mode change, cross-module consistency, reload, SPA navigation, latest-wins and new-tab persistence.
- **Negative/edge:** unsupported preset, unsupported mode, failed persistence write, first-visit baseline.
- **Fault injection:** localStorage write failure; persisted-state corruption via localStorage.
- **Not automated:** pixel-perfect rendering of gradients/video, OS colour-profile differences, cross-browser engines (only Chromium project configured; Firefox/WebKit can be enabled in `playwright.config.ts`), server-side/account-level preference sync (not implemented by the app), full WCAG audit of every screen.
