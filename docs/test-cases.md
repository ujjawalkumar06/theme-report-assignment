# Test scenarios and test cases

**Scope:** theme application, persistence, cross-module consistency and readability in the Report Module — plus every Report Module and Theme Studio option exercised during exploration. Theme-critical paths are automated; functional Report Module flows and advanced theme editors are documented as manual cases (out of the 4–6h automation scope).

**Legend:** ✅ passed · ⚠️ expected failure reproducing a defect (`test.fail`) · 📝 manual case

---

## 1. Test scenarios (high level)

| ID | Scenario | Covers |
|---|---|---|
| TS-01 | Theme selection applies immediately and consistently across Dashboard and Report | TC-01…TC-05, TC-08 |
| TS-02 | Theme persists across reload, SPA navigation and new tabs | TC-03, TC-04, TC-06, TC-12 |
| TS-03 | Customisation and saved themes work end-to-end | TC-09, TC-10, TC-11 |
| TS-04 | Report Module surfaces, controls and text remain readable and themed | TC-07, TC-15 |
| TS-05 | Negative/edge theme states are handled safely | TC-13, TC-14, TC-16 |
| TS-06 | Report Module functional options behave correctly | MAN-01…MAN-13 |
| TS-07 | Advanced Theme Studio editors apply and persist | MAN-14, MAN-15 |
| TS-08 | Header/global surfaces respect the theme | MAN-16 |
| TS-09 | Sort panel `Clear all` lifecycle | MAN-17 (DEF-04) |

---

## 2. Automated test cases

| ID | Scenario | Title | Automated test | Result |
|---|---|---|---|---|
| TC-01 | TS-01 | Change theme from Dashboard (Indigo Violet / Light) | `theme-report.spec.ts` → TH-01 | ✅ |
| TC-02 | TS-01 | Report Module reflects Dashboard theme (Corporate Blue / Dark) | → TH-02 | ✅ |
| TC-03 | TS-02 | Theme survives a hard refresh of Report | → TH-03 | ✅ |
| TC-04 | TS-01/02 | Dashboard → Report → Dashboard keeps theme | → TH-04 | ✅ |
| TC-05 | TS-01 | Second theme selection replaces the first | → TH-05 | ✅ |
| TC-06 | TS-02 | New tab after the change inherits the persisted theme | → TH-06 | ✅ |
| TC-07 | TS-04 | Report table/toolbar/filter dialog are themed and readable | → TH-07 | ✅ |
| TC-08 | TS-01 | All 6 presets × light/dark resolve documented tokens | → TH-09 | ✅ |
| TC-09 | TS-03 | Custom brand colour applies and survives reload | → TH-10 | ✅ |
| TC-10 | TS-03 | Custom theme can be saved via My Themes and re-applied | → TH-11 | ✅ |
| TC-11 | TS-03 | Reset to defaults restores Emerald / Light | → TH-12 | ✅ |
| TC-12 | TS-02 | First visit without stored preferences is consistent | `theme-edge.spec.ts` → EDGE-01 | ✅ |
| TC-13 | TS-05 | Unsupported persisted preset fails safe | → TH-08a | ✅ |
| TC-14 | TS-05 | Failed preference write (DEF-01) | → TH-08b | ⚠️ |
| TC-15 | TS-04 | Accent text contrast in light mode (DEF-02) | → DEF-02 | ⚠️ |
| TC-16 | TS-05 | Unsupported persisted mode (DEF-03) | → DEF-03 | ⚠️ |

**Execution summary:** 16 tests — 13 passed, 3 expected failures reproducing DEF-01/02/03.

### Detailed automated cases

| ID | Preconditions | Steps | Expected |
|---|---|---|---|
| TC-01 | Signed in, Dashboard | Theme Studio → Indigo Violet → Light → return to Dashboard | `data-theme-mode=light`, `--primary=#A97BFF`, persisted `indigo`/`light` |
| TC-02 | Theme Corporate Blue / Dark | Capture Dashboard fingerprint → open Report | Same mode/tokens; body bg = `--page-bg`; table header accent-tinted |
| TC-03 | Corporate Blue / Dark, Report | Hard reload | Theme unchanged after reload |
| TC-04 | Corporate Blue / Dark, Dashboard | Dashboard → Report → Dashboard | Theme fingerprint identical at each step |
| TC-05 | Corporate Blue / Dark | Select Emerald / Light → return to Report | Latest selection wins (`emerald`, `light`, `#10B981`) |
| TC-06 | Corporate Blue / Dark | New tab → sign in → open Report | Persisted theme applied in the new tab |
| TC-07 | Corporate Blue / Dark and Emerald / Light | Assert table text colour, header surface/contrast, toolbar controls, filter dialog tokens | Themed surfaces; primary text ≥ 4.5:1; controls enabled |
| TC-08 | Any | Select each of 6 presets and both modes | `presetId`, `--primary`, `--secondary`, `--page-bg`, `--text-main` match documented values |
| TC-09 | Emerald / Light | Colour Settings → Brand → set `#123456`; close; reload | `presetId=custom`, hex and resolved primary persist |
| TC-10 | Emerald / Light | Customise → Save as “Automation Theme” → switch to Corporate/Dark → apply saved theme → reload | Saved preset id/colour/mode restored and persisted |
| TC-11 | Amber / Dark | Customise → Reset to defaults → confirm | Emerald / Light, `--primary=#10B981`, customisations cleared |
| TC-12 | Fresh context | Sign in → open Report without changing theme | Concrete mode + consistent tokens; Report renders |
| TC-13 | Theme applied | `presetId=unsupported-preset` → reload | App renders, mode/background consistent, controls usable |
| TC-14 | Theme applied | Make `localStorage.setItem` throw → toggle mode | Expected: no unsaved UI state. Actual: UI/theme diverge silently → DEF-01 |
| TC-15 | Emerald / Light | Measure breadcrumb and filter heading contrast | Expected ≥ 4.5:1. Actual ≈ 2.54:1 → DEF-02 |
| TC-16 | Theme applied | `mode=sepia` → reload | Expected fallback. Actual: blank screen + `TypeError` → DEF-03 |

---

## 3. Manual test cases — Report Module options

These require functional assertions beyond the theme assignment scope; they are documented so the coverage is explicit and repeatable.

| ID | Area | Steps | Expected |
|---|---|---|---|
| MAN-01 | View dropdown | Click `Default View` → inspect Personal Views → `Create New Report View` → fill name/description/columns → Cancel | Menu lists Default View; creation form validates and cancels cleanly |
| MAN-02 | Search | Click Search → type `Ishaan` + Enter → clear | Result set narrows to 50, count `1–15 of 50`; clearing restores `1–15 of 1000` |
| MAN-03 | Sort | Sort → Add Sort Level → Full name / Ascending → Close → `Save changes`; reopen → Clear all → Close → Save | Column order applied after Save; Clear all + Save restores default order |
| MAN-04 | Filter | Filter → Add condition → choose column/operator/value; Add group; Clear all | Condition row appears; group enabled after a condition; clearing removes conditions |
| MAN-05 | Show/Hide Columns | Open columns panel → toggle a column / `All (13)` | Table columns update; all/none controls work |
| MAN-06 | List/Grid | Switch to Grid view → back to List | Cards render with identity/contact/details; table returns |
| MAN-07 | Export | More actions → Export → choose PDF / Excel (.xlsx) / JSON → Cancel | Dialog shows format, view, row/column counts, estimated size; cancel closes |
| MAN-08 | Grouping | More actions → Grouping → Add Group Level → select column | Group level added; save/discard flow behaves like Sort |
| MAN-09 | Audit History | More actions → Audit History | Event list shows view switches/user/time with pagination |
| MAN-10 | Scheduled Reports | More actions → Scheduled Reports | Empty state `No schedules yet`; `New schedule` available |
| MAN-11 | Row actions | First row → action button → View/Edit/Duplicate/Delete | Correct action opens; delete asks for confirmation |
| MAN-12 | Pagination | Next, Last, page input, rows per page | Page 2 = `16–30`, page 67 = `991–1000`; rows-per-page 10/15/25/50/100 |
| MAN-13 | New User | Click `New User` | `Add User Details` dialog: name, username, email, phone, department, role, status, title, territory, continent, country, state/province |
| MAN-17 | Sort `Clear all` | Apply a sort → reopen Sort → `Clear all` | **DEF-04:** panel stays open (despite name saying it closes); applied sort remains until Save |

## 4. Manual test cases — advanced theme options

| ID | Area | Steps | Expected |
|---|---|---|---|
| MAN-14 | Colour Settings | Brand/Text/Status tabs: change primary, secondary, heading/body text, status colours | Changes apply live to preview and app; persist |
| MAN-14 | Typography | Change body/heading font, H1–H4 sizes/weights, body size/line-height; upload font | Typography CSS variables update; custom font accepted |
| MAN-14 | Cards | Style Soft/Floating, shadow depth, header, nested, tint | Card surfaces/shadows update; persists |
| MAN-14 | Tables | Rows/Columns/Cells/Styling (density, dividers, alignment, header, stripes) | Table rendering and CSS variables update; preview switches to Orders |
| MAN-14 | Surface & Shape | Radius Sharp/Rounded/Round, exact px, density, effects | Radius/density tokens update |
| MAN-14 | Notifications | Placement (4 corners), behaviour (width/auto-dismiss) | Toast position/width/dismissal update; preview switches to Operations |
| MAN-14 | Login Screen | Brand image, logo, panel colour | Login preview updates; settings persist |
| MAN-15 | My Themes | Save (name required) → Rename → Download → Import → Edit → Delete → Cancel delete | Save/rename/delete/import/export work; delete requires confirmation; saved themes persist |
| MAN-16 | Global/header | Global Settings tabs (Header/Customer Profile/Footer/Sidebar), Notifications, Account, Help, fullscreen | Branding/theme surfaces update; menus and panels open/close correctly |

---

## 5. Traceability

| Scenario | Automated cases | Manual cases |
|---|---|---|
| TS-01 Theme consistency | TC-01…TC-05, TC-08 | — |
| TS-02 Persistence | TC-03, TC-04, TC-06, TC-12 | — |
| TS-03 Customisation/saved themes | TC-09, TC-10, TC-11 | MAN-15 |
| TS-04 Readability | TC-07, TC-15 | MAN-14 (visual) |
| TS-05 Negative/edge | TC-13, TC-14, TC-16 | — |
| TS-06 Report options | — | MAN-01…MAN-13 |
| TS-07 Advanced theme editors | — | MAN-14, MAN-15 |
| TS-08 Global surfaces | — | MAN-16 |
| TS-09 Sort clear-all | — | MAN-17 / DEF-04 |

## 6. Coverage notes

- **Automated:** theme application, all presets × modes, persistence (reload/SPA/new tab), custom colour, saved-theme re-apply, reset-to-defaults, Report readability, unsupported preset/mode, failed persistence write, accent contrast.
- **Manual (documented):** functional Report Module flows (view/search/sort/filter/columns/grid/export/grouping/audit/schedules/row actions/pagination/New User), advanced Theme Studio editors, My Themes management beyond save/apply, and global branding.
- **Not automated / out of scope:** pixel-perfect rendering of gradients/video, OS colour profiles, cross-browser engines (Chromium only configured), server-side preference sync (not implemented), full WCAG audit of every screen, destructive actions (delete user/theme) beyond cancel paths.
- **Confirmed defects:** DEF-01 (silent persistence failure), DEF-02 (light-mode accent contrast), DEF-03 (unsupported mode blank screen), DEF-04 (Sort `Clear all` panel/label mismatch). See `docs/defect-report.md`.
