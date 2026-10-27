# End-to-End Test Cases — OomniEye Staging

**Application:** https://base-application-stage.oomnieye.com
**Browser:** Chrome for Testing 156 (Playwright Chromium), 1440×900
**Account:** general-user staging account (credentials in `.env`, not committed)
**Last executed:** 2026-10-27

**Status legend:** ✅ Pass · ❌ Fail (confirmed defect) · ⚠️ Blocked / environment-dependent · ⏭ Not Run

**Summary:** 35 cases — 23 Pass · 4 Fail (DEF-01…DEF-04) · 1 Blocked · 7 Not Run.

| Test Case ID | Module | Priority | Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Status |
|---|---|---|---|---|---|---|---|---|
| E2E-AUTH-01 | Authentication | P0 | Sign in with the staging general user | Staging URL reachable; user provisioned | 1. Open `/#/login` → 2. Enter email/password → 3. Click **Sign in** | `APP_EMAIL` / `APP_PASSWORD` from `.env` | Redirect to `/#/dashboard/overview`; header and sidebar visible | ✅ Pass |
| E2E-AUTH-02 | Authentication | P1 | Reject invalid credentials | Login page open | 1. Enter valid email + wrong password → 2. Click **Sign in** | Valid email; invalid password | Error shown; no dashboard access; session not created | ⏭ Not Run |
| E2E-AUTH-03 | Authentication | P1 | Sign out | Signed in | 1. Click avatar → 2. Click **Sign Out** | — | Session cleared; redirected to login; protected routes inaccessible | ⏭ Not Run |
| E2E-DASH-01 | Dashboard | P0 | Dashboard loads after login | Valid session | 1. Sign in → 2. Wait for overview | — | Overview renders with widgets, sidebar, header, theme applied | ✅ Pass |
| E2E-THM-01 | Theme | P0 | Change preset and mode from Dashboard | Signed in on Dashboard | 1. Theme Studio → Theme Settings → Presets → **Indigo Violet** → mode **Light** → return to Dashboard | Indigo Violet / Light | `data-theme-mode=light`, `--primary=#A97BFF`, persisted `indigo`/`light` | ✅ Pass |
| E2E-THM-02 | Theme / Report | P0 | Report reflects the Dashboard theme | Theme Corporate Blue / Dark | 1. Capture Dashboard theme tokens → 2. Open Report Builder | Corporate Blue / Dark | Same mode, `--page-bg`, `--text-main`, `--primary`, `--secondary`; accent-tinted table header | ✅ Pass |
| E2E-THM-03 | Theme / Report | P0 | Theme persists after refresh | Corporate Blue / Dark on Report | 1. Hard reload → 2. Assert theme | Corporate Blue / Dark | Theme unchanged after reload | ✅ Pass |
| E2E-THM-04 | Theme | P1 | Theme survives Dashboard ↔ Report navigation | Corporate Blue / Dark | 1. Dashboard → Report → Dashboard → assert each step | Corporate Blue / Dark | No revert; tokens identical across modules | ✅ Pass |
| E2E-THM-05 | Theme | P1 | Latest theme selection wins | Corporate Blue / Dark on Report | 1. Open Theme Studio → select Emerald / Light → return to Report | Emerald / Light | `presetId=emerald`, `mode=light`, `--primary=#10B981` | ✅ Pass |
| E2E-THM-06 | Theme | P1 | New tab inherits persisted theme | Theme set; new browser tab | 1. Open new tab → 2. Sign in (sessionStorage is tab-scoped) → 3. Open Report | Corporate Blue / Dark | Persisted theme applied in the new tab | ✅ Pass |
| E2E-THM-07 | Theme | P1 | All supported presets × modes resolve documented tokens | Signed in | 1. For each of 6 presets → set light and dark → assert `presetId`, `--primary`, `--secondary`, `--page-bg`, `--text-main` | Corporate Blue, Emerald, Indigo Violet, Graphite, Ocean Teal, Amber | All 12 combinations match documented values | ✅ Pass |
| E2E-THM-08 | Theme | P1 | Custom brand colour applies and persists | Emerald / Light | 1. Colour Settings → Brand → set primary `#123456` → close → reload Report | `#123456` | `presetId=custom`; resolved primary and stored hex survive reload | ✅ Pass |
| E2E-THM-09 | Theme | P2 | Save custom theme and re-apply it | Emerald / Light, customised | 1. My Themes → **+ Save** → name → Save → switch preset → apply saved row → reload | Name: `Automation Theme`; colour `#123456` | Saved theme restores id, colour and mode; survives reload | ✅ Pass |
| E2E-THM-10 | Theme | P1 | Reset to defaults | Amber / Dark, customised | 1. `Reset to defaults` → confirm **Reset everything?** | — | Emerald / Light; `--primary=#10B981`; customisations cleared | ✅ Pass |
| E2E-THM-11 | Theme | P2 | Advanced editors persist (typography/cards/tables/surface/notifications/login) | Signed in | 1. Change a value in each section → close → reload → verify | Font, density, radius, toast position, login panel colour | Values apply live and persist | ⏭ Not Run |
| E2E-RPT-01 | Report | P1 | Search filters and clears | Report open | 1. Click Search → 2. Type `Ishaan` + Enter → 3. Clear | `Ishaan` | Count becomes `1–15 of 50`; clearing restores `1–15 of 1000` | ✅ Pass |
| E2E-RPT-02 | Report | P1 | Sort by column and save | Report open | 1. Sort → Add Sort Level → Full name / Ascending → Close → **Save changes** | Full name, Ascending | Table reorders (Aditya Sharma first); sort applies | ✅ Pass |
| E2E-RPT-03 | Report | P2 | Filter by condition | Report open | 1. Filter → Add condition → select column/operator/value → apply/close | e.g. Status = Full Time | Result set filtered; condition reflected; clear removes it | ⏭ Not Run (builder validated only) |
| E2E-RPT-04 | Report | P2 | Show/hide columns | Report open | 1. Show/Hide Columns → toggle a column → close | e.g. hide Phone number | Column hidden/shown; `All (13)` works | ⏭ Not Run |
| E2E-RPT-05 | Report | P2 | Switch Grid/List view | Report open | 1. Click **Grid view** → 2. Click **List view** | — | Grid shows cards; List restores table; pressed state reflects view | ✅ Pass |
| E2E-RPT-06 | Report | P1 | Paginate the table | Report open | 1. Next page → 2. First page → 3. Last page | — | Page 2 `16–30`; first `1–15`; last `991–1000` | ✅ Pass |
| E2E-RPT-07 | Report | P2 | Change rows per page | Report open | 1. Rows per page → select 10/15/25/50/100 | 10, 25, 50, 100 | Row count and pagination recalculate | ⏭ Not Run |
| E2E-RPT-08 | Report | P1 | Export PDF | Report open, 50 filtered rows | 1. More actions → Export → format PDF → **Download PDF** | 50 rows, 13 columns | PDF file downloads; success feedback | ⚠️ Blocked — success toast shown, no file captured in headless Chromium; verify in a headed browser |
| E2E-RPT-09 | Report | P2 | Export Excel / JSON | Report open | 1. More actions → Export → Excel (.xlsx) / JSON | 50 rows | Selected file downloads with correct extension | ⏭ Not Run |
| E2E-RPT-10 | Report | P2 | Audit history | Report open | 1. More actions → Audit History | — | Event list shows view/user/time with pagination | ✅ Pass (read-only observed) |
| E2E-RPT-11 | Report | P2 | Scheduled reports empty state | Report open | 1. More actions → Scheduled Reports | — | `No schedules yet`; `New schedule` available | ✅ Pass (read-only observed) |
| E2E-RPT-12 | Report | P2 | New User dialog opens | Report open | 1. Click **New User** | — | `Add User Details` with name/username/email/phone/department/role/status/title/territory/continent/country/state | ✅ Pass (open only; create not run) |
| E2E-RPT-13 | Report | P2 | Row action menu | Report open | 1. Row → action button | — | Menu shows View / Edit / Duplicate / Delete | ✅ Pass (open only; destructive actions not run) |
| E2E-RPT-14 | Report | P2 | Create new report view form | Report open | 1. View → Create New Report View | — | Form opens with name, description, 13 column checkboxes, Create/Cancel | ✅ Pass (open only; create not run) |
| E2E-NEG-01 | Negative | P1 | Unsupported persisted preset | Theme persisted; Report open | 1. Set `presetId=unsupported-preset` → reload | `unsupported-preset` | App renders with a consistent fallback | ✅ Pass |
| E2E-NEG-02 | Negative | P0 | Unsupported persisted mode | Theme persisted; Report open | 1. Set `mode=sepia` → reload | `sepia` | Fallback to a supported mode; app usable | ❌ Fail — DEF-03: blank screen + `TypeError` |
| E2E-NEG-03 | Negative | P1 | Failed preference write | Theme persisted | 1. Make `localStorage.setItem` throw → toggle mode | QuotaExceededError | Failure surfaced or UI not applied; UI/storage consistent | ❌ Fail — DEF-01: silent divergence; reverts on reload |
| E2E-NEG-04 | Accessibility | P1 | Accent text contrast in light mode | Emerald / Light, Report open | 1. Measure breadcrumb and filter heading contrast | `#10B981` on white | ≥ 4.5:1 (WCAG AA) | ❌ Fail — DEF-02: ≈ 2.54:1 |
| E2E-NEG-05 | Report | P3 | Sort `Clear all` behaviour | Sort applied | 1. Sort → Clear all → observe panel/table | — | Panel closes and applied sort clears (per accessible name) | ❌ Fail — DEF-04: panel stays open; sort remains until Save |
| E2E-FLOW-01 | End-to-End | P0 | Full journey: login → theme → report → search → pagination → grid → export → reset | Fresh session | 1. Sign in → 2. Dashboard → Corporate Blue / Dark → 3. Report → 4. Search `Ishaan` → clear → 5. Next/First page → 6. Grid/List → 7. Export PDF → 8. Reset to defaults | Corporate Blue / Dark; `Ishaan` | Every step completes in order; theme consistent; Report usable; reset restores Emerald / Light | ✅ Pass (export step blocked as above) |

---

## Defect mapping

| Defect | Test case | Severity |
|---|---|---|
| DEF-01 — silent persistence failure | E2E-NEG-03 / TC-14 | Low |
| DEF-02 — accent contrast (light) | E2E-NEG-04 / TC-15 | Medium |
| DEF-03 — unsupported mode blank screen | E2E-NEG-02 / TC-16 | High |
| DEF-04 — Sort `Clear all` lifecycle | E2E-NEG-05 / MAN-17 | Low |

Details and RCA: `docs/defect-report.md`.

## Status notes

- **Pass** means the flow was executed end-to-end in the live staging UI (or by the automated suite where noted in `docs/test-cases.md`).
- **Not Run** cases were explored only up to the entry point (dialog/menu/panel opens) or not executed to avoid creating/deleting staging data.
- **Blocked (Export PDF):** the UI reported “Export completed successfully (PDF)” but headless Chromium captured no download and opened no page. This may be a headless save-dialog limitation; retest in a headed browser before treating it as a product defect.
- No credentials appear in this document; values are loaded from `.env` at runtime.
