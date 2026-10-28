# Theme Update & Report Module Validation

Playwright + TypeScript automation for the OomniEye staging assignment. It validates that changing the application theme is applied, persisted and reflected consistently in the **Report Module**, and documents four confirmed defects and a 129-case E2E catalogue.

**Application:** https://base-application-stage.oomnieye.com
**Stack:** Playwright 1.64.1 · TypeScript 5.7 · Node.js 22 · Chromium
**Test result (latest run):** 94 tests — 72 passing, 4 expected failures reproducing defects, 18 skipped (not run / destructive / blocked).
**Repository:** https://github.com/ujjawalkumar06/theme-report-assignment (public)

---

## 1. What was validated

| Area | Coverage |
|---|---|
| Theme application | All six presets × light/dark modes (documented tokens), custom brand colours, saved themes, reset to defaults |
| Persistence | Hard reload, SPA navigation Dashboard ↔ Report, new tab after the change |
| Cross-module consistency | Dashboard vs Report fingerprint (`data-theme-mode`, `--page-bg`, `--text-main`, `--primary`, `--secondary`, card/border tokens) |
| Report Module UI | Table header/body, toolbar, filter dialog, body background, controls |
| Negative / edge | Unsupported preset, unsupported mode, failed preference write, first-visit baseline |
| Report Module options | View/search/sort/filter/columns/list-grid/pagination/rows-per-page/export/grouping/audit/schedules/row actions/New User |
| Login & shell | Valid/invalid login, show-hide password, forgot-password guidance, deep-link redirect, logout, sidebar, fullscreen, header panels |
| Account & Global Settings | Account Settings sections, profile menu, Global Settings tabs, footer links |
| Catalogue & automation | 129 E2E cases (`docs/e2e-test-cases.csv`) mapped to automated specs and skipped declarations |
| Accessibility | Accent text contrast in light mode |
| Evidence | Failed-write screenshot/state, blank-screen screenshot, low-contrast screenshot |

Requirements TH-01…TH-07 pass. TH-08 revealed two persistence/safety failures (DEF-01, DEF-03) and the inspection work revealed an accessibility defect (DEF-02).

See:
- `docs/exploration.md` — application exploration, real selectors, theme mechanism, assumptions
- `docs/test-cases.md` — scenario table with steps, expected/actual
- `docs/e2e-test-cases.csv` — canonical catalogue: 129 cases (ID, module, priority, scenario, pre-conditions, steps, data, expected, status)
- `docs/e2e-automation-map.md` — case IDs → automated specs
- `docs/bug-issue-sheet.csv` — 19 reported issues with steps, actual/expected results, severity/priority TBD
- `docs/defect-report.md` — DEF-01/02/03/04 with reproduction, RCA and fixes
- `docs/evidence/` — screenshots and raw observations

---

## 2. Quick start

```bash
# from this directory
npm install
npx playwright install chromium

cp .env.example .env
# edit .env with the staging credentials (never commit it)

npm test                 # full suite, HTML report in playwright-report/
npm run report           # open the HTML report
```

### Environment variables

| Variable | Purpose |
|---|---|
| `APP_BASE_URL` | Staging origin (no trailing slash required) |
| `APP_EMAIL` | Staging general-user email |
| `APP_PASSWORD` | Staging password |

`.env` is git-ignored. `.env.example` contains placeholders only. **No credentials are hardcoded in page objects, tests or configuration.**

---

## 3. Commands

| Command | Description |
|---|---|
| `npm test` | Run all tests with list + HTML reporters |
| `npm run test:report` | Happy-path suite (`tests/theme-report.spec.ts`) |
| `npm run test:edge` | Negative/edge suite (`tests/theme-edge.spec.ts`) |
| `npm run test:e2e` | End-to-end platform suite (`tests/e2e/**`) |
| `npm run test:theme` | Theme-focused suites |
| `npm run test:defects` | Only the expected-failure defect tests |
| `npm run e2e:csv` | Regenerate the E2E CSV catalogue |
| `npm run test:headed` | Run with a visible browser |
| `npm run typecheck` | TypeScript strict check |
| `npm run report` | Open the last HTML report |

Single scenario examples:

```bash
npx playwright test -g "TH-02"
npx playwright test -g "DEF-03"
```

---

## 4. Project structure

```
theme-report-assignment/
├── tests/
│   ├── theme-report.spec.ts     # TH-01 … TH-12
│   ├── theme-edge.spec.ts       # EDGE-01, TH-08a/b/c, DEF-01/02/03
│   └── e2e/
│       ├── auth-shell.spec.ts
│       ├── report-options.spec.ts
│       ├── theme-options.spec.ts
│       ├── account-global.spec.ts
│       ├── journey.spec.ts
│       └── declared-cases.spec.ts   # not-run/destructive cases (skipped)
├── src/
│   ├── config/
│   │   ├── env.ts               # .env loading, routes
│   │   └── themes.ts            # presets, mode tokens, expected resolved values
│   ├── fixtures/
│   │   └── app.fixture.ts       # authenticated App fixture (UI login)
│   ├── pages/
│   │   ├── BasePage.ts          # shell, sidebar, intro overlay, nav
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── ReportPage.ts
│   │   └── ThemeStudioPage.ts   # preset + mode selection via real UI
│   └── utils/
│       ├── theme.ts             # theme snapshot/assertions, fault injection
│       ├── color.ts             # parsing, compositing, WCAG contrast
│       └── contrast.ts          # in-page contrast audit
├── docs/
│   ├── exploration.md
│   ├── test-cases.md
│   ├── e2e-test-cases.csv
│   ├── e2e-automation-map.md
│   ├── bug-issue-sheet.csv
│   ├── defect-report.md
│   └── evidence/
├── scripts/
│   └── generate-e2e-cases.mjs
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

---

## 5. Design decisions

- **Real DOM, no guessed attributes.** Exploration confirmed the actual mechanism: `<html data-theme-mode>` plus CSS custom properties, persisted in `localStorage["omnieye-theme-studio"]`. Assertions read those values and computed styles; the suite never assumes a generic `data-theme` attribute.
- **Page Object Model.** `ThemeStudioPage` owns preset/mode selection and persistence checks; `ReportPage` owns the two-table layout, toolbar and filter dialog; `DashboardPage`/`LoginPage` own navigation and authentication. Shared shell behaviour (sidebar expansion, intro overlay, theme read) lives in `BasePage`.
- **Configuration and data separated from logic.** Credentials come from `.env`; presets, mode tokens and expected resolved colours live in `src/config/themes.ts`.
- **Web-first assertions, no fixed waits.** `expect`, `expect.poll`, `toBeVisible`, `toHaveURL` are used throughout. There is no `waitForTimeout` in the test suite; the only timed wait is a bounded `waitForSelector` used to collect evidence for the blank-screen defect.
- **Independent tests.** Every test gets a fresh browser context and logs in through the UI. Theme state is selected through the application, not injected, except in explicit fault-injection tests.
- **Failure diagnostics.** `trace: retain-on-failure`, screenshots/video on failure, plus explicit `testInfo.attach` evidence for the three reproduced defects.
- **Meaningful messages.** Assertions carry messages that include the expected token, actual value and the defect ID where relevant.
- **Defects are visible, not hidden.** DEF-01/02/03 use Playwright `test.fail()` with a description and evidence attachments. The suite stays green while the HTML report shows them as expected failures; if the application is fixed the tests become "unexpected pass" and must be un-marked. This is intentional so the deliverable exercises the defects.

### Theme assertions used

- `data-theme-mode` equals the selected mode.
- `localStorage` `presetId`, `mode`, `primaryHex`, `secondaryHex` equal the selection.
- Resolved `--page-bg`, `--text-main`, `--primary`, `--secondary` equal the documented preset/mode values.
- Body background colour matches `--page-bg` (RGB comparison tolerates `color(srgb …)`/alpha serialisation in modern Chromium).
- Dashboard and Report fingerprints are identical.
- Table cells use `--text-main`; table header surface is accent-tinted and ≥ 4.5:1; filter dialog uses the theme surface/text tokens.

---

## 6. Execution summary

```
Running 94 tests using 1 worker

76 passed
18 skipped
0 failed
8.5m

Includes:
- 16 theme/persistence/defect tests (3 expected failures: DEF-01/02/03)
- 15 auth + shell tests
- 28 report option tests (18 passed + 1 expected failure DEF-04, 9 declared skips)
- 14 theme-editor tests (12 passed, 2 declared skips)
- 13 account/global tests
- 1 full end-to-end journey
- 7 declared not-run cases
```

Artifacts: `playwright-report/index.html` (open with `npm run report`), traces/video/screenshots under `test-results/`, defect evidence under `docs/evidence/`.

---

## 7. E2E catalogue and automation coverage

- **Canonical catalogue:** `docs/e2e-test-cases.csv` — 129 cases (105 Pass, 4 Fail, 1 Blocked, 19 Not Run).
- **Automation:** `tests/e2e/` contains real tests for the safe/executed cases and explicit skipped declarations for not-run/destructive/blocked cases.
- **Mapping:** `docs/e2e-automation-map.md` lists every spec and the case IDs it covers.
- **Defects:** the four expected-failure tests reproduce DEF-01…DEF-04 with evidence attachments.
- **Blocked export:** PDF/XLSX/JSON downloads show a success toast but no file is captured in headless Chromium; retest in a headed browser before filing a product defect.

---

## 8. Defects found (summary)

| ID | Severity | Summary |
|---|---|---|
| DEF-03 | **High** | An unsupported persisted theme **mode** crashes hydration (`Cannot read properties of undefined (reading 'disabled')`) and renders a blank screen until storage is cleared. |
| DEF-02 | Medium | Emerald light mode uses the raw accent `#10B981` for headings/breadcrumbs → ≈ 2.54:1 on white (WCAG AA requires 4.5:1). |
| DEF-01 | Low | A failed `localStorage` write is silent: UI applies the new theme, storage keeps the old one, and the theme reverts on reload. |
| DEF-04 | Low | Sort → `Clear all` does not close the Sort panel (contrary to its accessible name) and keeps the applied sort until an explicit Save. |

Full reproduction, expected/actual, evidence and RCA: `docs/defect-report.md`.

### Reported issue sheet (19 issues)

`docs/bug-issue-sheet.csv` captures the stakeholder-reported issues:

| Module | Issues |
|---|---:|
| Global Issues | 2 |
| Top Header | 1 |
| Sidebar | 4 |
| Dashboard – Video Player | 7 |
| Report Builder | 3 |
| Theme Studio | 2 |
| **Total** | **19** |

Severity and priority are intentionally **TBD** in the sheet pending assessment, as stated in the source report. BUG-002 (backend integration) and BUG-016 (new user not persisted) are flagged as related and require backend investigation.


---

## 9. Assumptions and limitations

**Assumptions**
- The theme preference is a per-browser setting; the application has no theme API and the brief does not require account-level sync. The absence of server persistence is treated as design.
- “Report Module” is the `Report Builder` screen (`#/dashboard/reports`) available to the supplied general user.
- The header stays dark in light themes because of Global Settings branding, so it is excluded from light-mode background assertions.
- `Reset to defaults` has an unclear contract and is not asserted.

**Limitations**
- Only the Chromium project is configured. Firefox/WebKit can be added in `playwright.config.ts`; the app is a standard SPA and the suite uses role-based locators, but cross-browser runs should be executed before release.
- Persistence is client-side only, so there is nothing server-side to validate.
- A tab already open before a theme change does **not** live-update (no `storage` event handling). This is documented as a limitation, not a reported defect, because no requirement specifies live cross-tab sync.
- Visual/pixel-perfect checks (gradients, video, OS colour profiles) are out of scope; contrast is computed from real DOM colours.
- The full WCAG audit is limited to the Report Module accent/muted text probe; a complete accessibility audit is recommend as follow-up.
- The staging user has no admin-only screens, so validation covers only the screens reachable by that role.
- The fault-injection tests alter browser APIs (`Storage.prototype.setItem`) or storage values; they are isolated to their own fresh contexts.

---

## 10. Security notes

- Credentials are read from `.env` at runtime; `.env` is ignored by `.gitignore` and is **not** part of the deliverable.
- No credentials appear in page objects, tests, configuration, screenshots or reports.
- The HTML report/traces contain application pages only; no password fields are captured after submission.
- `.env.example` contains placeholders only.

## 11. Recommended next steps

1. Fix DEF-03 (validate/coerce persisted theme state, add error boundary) — highest risk.
2. Fix DEF-02 by deriving accessible accent text tokens and adding a contrast gate for every preset × mode.
3. Fix DEF-01 by handling persistence failures explicitly.
4. Align the Sort `Clear all` behaviour/label (DEF-04) and add functional Report tests (search/sort/filter/export) to CI.
5. Add Firefox/WebKit projects and a CI job; publish the HTML report as an artifact.
6. Add cross-tab synchronisation if live updates are a product requirement.

---

## 12. AI tool usage disclosure

AI tooling was used as an assistant during this assignment. The brief explicitly permits AI tools and asks for this disclosure.

**Tools used**
- **opencode CLI coding agent** (model `deepseek-v4.1-flash`) — planning, code generation, test execution, documentation drafting.
- **Playwright MCP browser** — interactive exploration of the live staging application.

**Where and how it was used**
1. **Application exploration (Task 1):** the browser agent signed in, located Theme Studio, enumerated the six presets, inspected the real theme mechanism (`data-theme-mode`, resolved CSS custom properties, `localStorage["omnieye-theme-studio"]`), and recorded selectors and assumptions. No theme implementation was assumed up front.
2. **Framework and tests (Task 3):** the agent scaffolded the Playwright/TypeScript project, Page Objects, configuration/test data separation, theme assertion helpers, contrast utilities, fault-injection helpers, and the TH-01…TH-08 / edge tests.
3. **Execution and evidence:** the agent ran the suite against staging, iterated on locator/assertion failures, captured screenshots and traces, and reproduced the three reported defects.
4. **Documentation:** the agent drafted `README.md`, `docs/exploration.md`, `docs/test-cases.md` and `docs/defect-report.md` from the observed results and executed tests.

**What was not delegated**
- Credentials were supplied by the hiring team and are stored only in the git-ignored `.env`; they were never generated by or exposed to the AI tooling in source control, reports or screenshots.
- No test results were fabricated: every scenario was executed against the live staging environment, and the HTML report plus failure evidence are included.
- The candidate reviewed the plan and the repository contents (including secrets/Git handling) before submission and remains responsible for the final deliverable.

**Review note:** AI-generated code and prose should be reviewed by the submitter; the suite is type-checked (`npm run typecheck`) and the full run is reproducible with `npm test`.
