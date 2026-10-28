# Automated test list (94 Playwright tests)

Generated from the latest full run (76 passed / 18 skipped). Expected failures are defect reproductions (DEF-01…DEF-04).

## e2e/account-global.spec.ts (13)

| # | Test | Status |
|---:|---|---|
| | E2E-ACC-01/02 - page and personal information render | Pass |
| | E2E-ACC-03/05/06 - preferences, language and timezone | Pass |
| | E2E-ACC-04 - Cookie Preferences opens | Pass |
| | E2E-ACC-07 - Active Sessions opens | Pass |
| | E2E-ACC-08 - Login History opens | Pass |
| | E2E-ACC-09 - Advanced Settings opens | Pass |
| | E2E-ACC-10 - Backup & Reset opens without confirming | Pass |
| | E2E-ACC-11 - Edit Profile from the account menu | Pass |
| | E2E-ACC-MENU - Menu Item 2 routes to Account Settings | Pass |
| | E2E-GLB-01/02 - Header and Customer Profile tabs | Pass |
| | E2E-GLB-03 - Footer tab and Add Link | Pass |
| | E2E-GLB-04 - Sidebar tab | Pass |
| | E2E-GLB-05 - Global Settings close | Pass |

## e2e/auth-shell.spec.ts (15)

| # | Test | Status |
|---:|---|---|
| | E2E-LOGIN-02 - invalid credentials show an inline error | Pass |
| | E2E-LOGIN-03 - empty fields keep Sign in disabled | Pass |
| | E2E-LOGIN-04 - Show/Hide password toggles the input | Pass |
| | E2E-LOGIN-06 - Forgot password shows admin contact guidance | Pass |
| | E2E-LOGIN-07 - unauthenticated deep link redirects to login | Pass |
| | E2E-LOGIN-01 - valid login reaches the dashboard | Pass |
| | E2E-LOGIN-09 - session survives reload | Pass |
| | E2E-LOGIN-08 - logout clears the session | Pass |
| | E2E-DASH-01 - dashboard shell renders | Pass |
| | E2E-DASH-03 - sidebar collapses and expands | Pass |
| | E2E-DASH-05 - fullscreen enters and exits | Pass |
| | E2E-DASH-11 - Global Settings opens with Header/Footer tabs | Pass |
| | E2E-DASH-12 - Notifications panel opens | Pass |
| | E2E-DASH-13 - Account menu opens | Pass |
| | E2E-DASH-14 - Help panel opens | Pass |

## e2e/declared-cases.spec.ts (7)

| # | Test | Status |
|---:|---|---|
| | E2E-LOGIN-05 - Remember me option [Not Run: preference persistence not verified] | Skipped |
| | E2E-LOGIN-10 - Email format validation [Not Run: native validation not exercised] | Skipped |
| | E2E-DASH-08 - Appearance tab [Not Run: dashboard setup tab] | Skipped |
| | E2E-DASH-09 - Content tab [Not Run: dashboard setup tab] | Skipped |
| | E2E-GLB-06 - Save global settings [Not Run: would persist branding changes] | Skipped |
| | E2E-ACC-12 - Save personal information [Not Run: would modify profile data] | Skipped |
| | E2E-NOT-02 - View all notifications [Not Run] | Skipped |

## e2e/journey.spec.ts (1)

| # | Test | Status |
|---:|---|---|
| | E2E-FLOW-01 - full journey: login → theme → report → search → pagination → grid → export → reset | Pass |

## e2e/report-options.spec.ts (28)

| # | Test | Status |
|---:|---|---|
| | E2E-RPT-01/02/03 - search filters and clears | Pass |
| | E2E-RPT-04 - sort panel lists all 13 columns | Pass |
| | E2E-RPT-05 - sort applies after Save changes | Pass |
| | E2E-RPT-07/08 - filter panel and condition builder | Pass |
| | E2E-RPT-11 - Show/Hide Columns lists all 13 columns | Pass |
| | E2E-RPT-13/14 - list and grid views switch | Pass |
| | E2E-RPT-15/16 - pagination next and last | Pass |
| | E2E-RPT-18 - rows-per-page options are offered | Pass |
| | E2E-RPT-20 - view dropdown lists personal views and create option | Pass |
| | E2E-RPT-21 - create report view form opens | Pass |
| | E2E-RPT-23 - More actions lists all options | Pass |
| | E2E-RPT-24 - export offers PDF, Excel and JSON | Pass |
| | E2E-RPT-28 - grouping panel opens | Pass |
| | E2E-RPT-29 - audit history lists events | Pass |
| | E2E-RPT-30 - scheduled reports empty state | Pass |
| | E2E-RPT-32 - row actions menu lists View/Edit/Duplicate/Delete | Pass |
| | E2E-RPT-34 - New User dialog opens with all fields | Pass |
| | E2E-RPT-37 - table header sort reacts | Pass |
| | E2E-RPT-06 - Sort Clear all keeps the panel open and sort applied (DEF-04) | Expected fail |
| | E2E-RPT-25 - Export PDF | Skipped |
| | E2E-RPT-26/27 - Export Excel/JSON | Skipped |
| | E2E-RPT-10 - Filter apply/clear | Skipped |
| | E2E-RPT-12 - Toggle column | Skipped |
| | E2E-RPT-17/19 - Page jump / rows-per-page change | Skipped |
| | E2E-RPT-22 - Create report view (destructive) | Skipped |
| | E2E-RPT-31 - New schedule | Skipped |
| | E2E-RPT-33 - Row View | Skipped |
| | E2E-RPT-35/36 - New User validation/create | Skipped |

## e2e/theme-options.spec.ts (14)

| # | Test | Status |
|---:|---|---|
| | E2E-THM-03/04 - My Themes tab and Save-disabled state | Pass |
| | E2E-THM-15/16/17 - Colour Settings tabs and colour inputs | Pass |
| | E2E-THM-18 - Typography controls | Pass |
| | E2E-THM-19 - Cards controls | Pass |
| | E2E-THM-20 - Tables controls and Orders preview | Pass |
| | E2E-THM-21 - Surface & Shape controls | Pass |
| | E2E-THM-22 - Notifications controls and Operations preview | Pass |
| | E2E-THM-23 - Login Screen controls | Pass |
| | E2E-THM-24 - preview screens list | Pass |
| | E2E-THM-25 - preview zoom control | Pass |
| | E2E-THM-08/09 - rename saved theme and cancel delete | Pass |
| | E2E-THM-11 - download theme JSON | Pass |
| | E2E-THM-12 - Import theme JSON | Skipped |
| | E2E-THM-10 - Delete saved theme | Skipped |

## theme-edge.spec.ts (5)

| # | Test | Status |
|---:|---|---|
| | EDGE-01 - first visit without stored preferences renders a consistent theme | Pass |
| | TH-08a - an unsupported persisted preset does not break the Report Module | Pass |
| | DEF-02 - accent text must meet WCAG AA contrast in light mode | Expected fail |
| | DEF-03 - an unsupported persisted mode must not blank the application | Expected fail |
| | TH-08b - a failed preference write must not leave the session and storage out of sync (DEF-01) | Expected fail |

## theme-report.spec.ts (11)

| # | Test | Status |
|---:|---|---|
| | TH-01 - changing the theme from the Dashboard applies it immediately | Pass |
| | TH-02 - Report Module reflects the theme selected on the Dashboard | Pass |
| | TH-03 - Report Module keeps the theme after a refresh | Pass |
| | TH-04 - theme stays consistent across Dashboard and Report navigation | Pass |
| | TH-05 - selecting a second theme replaces the previous selection in the Report Module | Pass |
| | TH-06 - a new tab opened after the change applies the persisted theme | Pass |
| | TH-07 - Report Module surfaces, text and controls stay readable and themed | Pass |
| | TH-09 - every supported preset applies its documented tokens in both modes | Pass |
| | TH-10 - a custom brand colour applies and persists | Pass |
| | TH-11 - a custom theme can be saved and applied again | Pass |
| | TH-12 - Reset to defaults restores Emerald light and clears customisations | Pass |
