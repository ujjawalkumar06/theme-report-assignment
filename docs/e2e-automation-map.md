# E2E automation map

Canonical catalogue: `docs/e2e-test-cases.csv` (129 cases).

| Spec | Case IDs / area | Notes |
|---|---|---|
| `tests/e2e/auth-shell.spec.ts` | E2E-LOGIN-01…09, E2E-DASH-01/03/05/11/12/13/14 | Raw login tests + authenticated shell |
| `tests/e2e/report-options.spec.ts` | E2E-RPT-01…38 | Search/sort/filter/columns/views/pagination/export dialog/audit/schedules/row actions/New User/header sort; skips for RPT-10/12/17/19/22/25/26/27/31/33/35/36 |
| `tests/e2e/theme-options.spec.ts` | E2E-THM-03/04/08/09/11/15…25 | Sections, My Themes rename/delete-cancel, download; skips for THM-10/12 |
| `tests/e2e/account-global.spec.ts` | E2E-ACC-01…11, E2E-GLB-01…05 | Account page sections, profile menu, Global Settings tabs/footer |
| `tests/e2e/journey.spec.ts` | E2E-FLOW-01 | Login → theme → report → search → pagination → grid → export dialog → reset |
| `tests/theme-report.spec.ts` | E2E-THM-01/02/05/06/07/14/26/27/28 | Theme presets, persistence, custom colour, saved theme, reset |
| `tests/theme-edge.spec.ts` | E2E-NEG-01…04 / THM-29…33 | Unsupported preset/mode, failed write, contrast (expected failures) |
| `tests/e2e/declared-cases.spec.ts` | E2E-LOGIN-05/10, E2E-DASH-08/09, E2E-GLB-06, E2E-ACC-12, E2E-NOT-02 | Declared but not run (skipped) |

## Skipped / not-run cases

| Case IDs | Reason |
|---|---|
| E2E-RPT-10 | Filter apply/clear — builder validated, full apply pending |
| E2E-RPT-12 | Column toggle |
| E2E-RPT-17/19 | Page jump / rows-per-page change |
| E2E-RPT-22 | Create report view (data creation) |
| E2E-RPT-25 | Export PDF — success toast, no file in headless Chromium |
| E2E-RPT-26/27 | Export Excel/JSON — same download mechanism as PDF |
| E2E-RPT-31 | New schedule form |
| E2E-RPT-33 | Row View |
| E2E-RPT-35/36 | New User validation/create (data creation) |
| E2E-THM-10 | Delete saved theme (destructive) |
| E2E-THM-12 | Import theme JSON (file chooser) |
| E2E-LOGIN-05/10, E2E-DASH-08/09, E2E-GLB-06, E2E-ACC-12, E2E-NOT-02 | Not run / data-changing |

## Defect mapping

| E2E case | Defect | Automated test |
|---|---|---|
| E2E-NEG-02 | DEF-03 — unsupported mode blank screen | `theme-edge.spec.ts` |
| E2E-NEG-03 | DEF-01 — silent persistence failure | `theme-edge.spec.ts` |
| E2E-NEG-04 | DEF-02 — accent contrast | `theme-edge.spec.ts` |
| E2E-NEG-05 / E2E-RPT-06 | DEF-04 — Sort Clear all | `report-options.spec.ts` (expected failure) |
