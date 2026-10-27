# Task 1 — Application exploration

**Application:** OomniEye staging — https://base-application-stage.oomnieye.com
**Account:** general-user staging account supplied by the hiring team (values loaded from `.env`, never committed).
**Explored:** Chromium 156 (Playwright 1.64.1), viewport 1440×900.

## 1. Authentication and routing

| Item | Observation |
|---|---|
| Entry URL | `/#/dashboard/` redirects unauthenticated users to `/#/login` |
| Sign-in fields | `Email address`, `Password` (labels are accessible names) |
| Sign-in button | `Sign in`, disabled until both fields are valid |
| Post-login route | `/#/dashboard/overview` |
| Auth storage | `sessionStorage`: `omnieye_auth_session`, `omnieye_auth_role`, `omnieye_auth_email` |
| Consequence | Authentication is **tab-scoped**. A new tab must sign in again; the selected theme is still inherited (see §4). |
| First-run overlay | Dashboard shows a full-screen intro with `aria-label="Click anywhere to skip intro"`; it must be dismissed before interacting |

## 2. Theme controls

Three entry points exist:

1. **Header quick toggle** — button whose accessible name is `Switch to Dark Mode` / `Switch to Light Mode` (title attribute changes with the active mode).
2. **Theme Studio** — sidebar → `Theme Studio` (`#/dashboard/reports?themeStudio=true`). Full-screen editor with collapsible sections: *Theme Settings*, *Colour Settings*, *Typography*, *Cards*, *Tables*, *Surface & Shape*, *Notifications*, *Login Screen*.
3. **Global Settings** — header → `Global Settings`. Edits branding (company name, logo, **header background**) — not the theme preset. This is why the top bar stays dark in light themes.

### Theme Studio → Theme Settings

Tabs: **Presets**, **My Themes**, **Mode**. Header shows the active preset and mode, plus `Reset to defaults` and a `Switch to light` / `Switch to dark` shortcut.

Supported presets and their stored values (captured by selecting each preset through the UI):

| UI label | Stored `presetId` | `primaryHex` | `secondaryHex` | Resolved `--primary` light | Resolved `--primary` dark |
|---|---|---|---|---|---|
| Corporate Blue | `corporate` | `#4F6BFF` | `#22D3EE` | `#4F6BFF` | `#7d8fe8` |
| Emerald | `emerald` | `#10B981` | `#F5A524` | `#10B981` | `#85e0c2` |
| Indigo Violet | `indigo` | `#A97BFF` | `#FF5FA2` | `#A97BFF` | `#a27de8` |
| Graphite | `slate` | `#455a64` | `#78909c` | `#455a64` | `#a3b8c2` |
| Ocean Teal | `teal` | `#00838f` | `#0277bd` | `#00838f` | `#7ddfe8` |
| Amber | `amber` | `#e65100` | `#d84315` | `#e65100` | `#e8a27d` |

Supported modes: **light**, **dark**. Mode tokens:

| Token | Light | Dark |
|---|---|---|
| `data-theme-mode` | `light` | `dark` |
| `--page-bg` | `#ffffff` | `#121212` |
| `--text-main` | `rgba(0,0,0,0.92)` | `rgba(255,255,255,0.96)` |
| `--bg-card` | `#ffffff` | `#212121` |
| Body background | `rgb(255,255,255)` | `rgb(18,18,18)` |

## 3. How the theme is applied and persisted

- The resolved theme is written to `<html data-theme-mode="light|dark">` **and** as inline CSS custom properties on `<html>` (`--primary`, `--accent`, `--page-bg`, `--text-main`, `--bg-card`, `--secondary`, `--border-light`, typography, radius, table density, …).
- No theme API call is made. Network inspection showed only Cloudflare RUM beacons; the preference is **client-side only**.
- Persistence key: `localStorage["omnieye-theme-studio"]`, a Zustand-style payload:

```json
{
  "state": {
    "settings": {
      "presetId": "corporate",
      "mode": "dark",
      "primaryHex": "#4F6BFF",
      "secondaryHex": "#22D3EE",
      "...": "typography, card, table, notification, login settings"
    },
    "savedThemes": [],
    "baseline": "{...}",
    "editingSavedId": null,
    "lastImportedId": null
  },
  "version": 0
}
```

- Selecting a preset or toggling the mode persists immediately.
- On a **fresh** browser profile the default theme renders, but the storage key is not written until the first theme change.
- Persistence is per browser profile; it is not tied to the account.

Reported and verified transitions:

| Action | Result |
|---|---|
| Select preset in Theme Studio | Applied live to `<html>` and persisted |
| Toggle mode (header or Theme Studio) | `data-theme-mode`, CSS variables and body colours change; persisted |
| Hard reload | Theme reapplied from localStorage |
| SPA navigation Dashboard ↔ Report | Theme unchanged |
| New tab opened **after** the change | Theme applied (localStorage is shared); sign-in required (sessionStorage is not) |
| Tab already open **before** the change | Does **not** live-update (no `storage` event listener); next reload picks it up |
| Unsupported preset (`presetId`), valid mode | App renders; colours fall back from the stored `primaryHex` |
| Unsupported mode (`sepia`, etc.) | **Blank screen** — see DEF-03 |
| localStorage write failure | UI applies the change, storage keeps the old value, no feedback — see DEF-01 |

## 4. Report Module

- Route: `#/dashboard/reports`
- Breadcrumb: `Reports › Test`
- Data: employee/report table, 1000 rows, 15 per page (67 pages), 14 data columns + row action.
- Toolbar: `Default View`, `Search`, `Sort`, `Filter`, `Show/Hide Columns`, `List view` / `Grid view`, `More actions`.
- Table is split into two `<table>` elements (sticky header table + body table); body rows carry `tbody tr`.
- Filter opens an in-page MUI Paper dialog (`Filter columns`) with `+ Add condition`, `+ Add group`, `Clear all`.
- Row actions, pagination (`First/Previous/Next/Last`, page input, rows-per-page select), and a `New User` button are present.

### Theme-sensitive Report elements inspected

| Element | Observation |
|---|---|
| Page/body background | Follows `--page-bg` |
| Table header cell | Accent-tinted surface (translucent `--primary`), themed text |
| Table body cells | `--text-main` |
| Breadcrumb/title | Accent colour |
| Toolbar buttons/icons | Accent for active controls; themed borders |
| Filter dialog | Themed surface + gradient, themed text, accent heading |
| Pagination/muted helper text | Muted token (`--text-muted`), low emphasis |

## 5. Workflow used for automation

1. Navigate to `/#/login`, authenticate from environment variables.
2. Dismiss the intro overlay if present.
3. Open **Theme Studio** from the sidebar (expand the sidebar if collapsed).
4. Expand **Theme Settings**, choose a preset, then set the mode via the panel's `Switch to light/dark` control.
5. Leave Theme Studio by navigating to Dashboard or Report (routing clears the editor; `Escape` closes the editor dialog but the route/query remains).
6. Assert `<html data-theme-mode>`, resolved CSS variables, body colours, persisted `presetId`/`mode`/hex values, and cross-module fingerprints.
7. Refresh and navigate to prove persistence.

## 6. Locator strategy

| Target | Locator | Reason |
|---|---|---|
| Login fields | `getByRole('textbox', { name: 'Email address' / 'Password' })` | Accessible labels |
| Sign in | `getByRole('button', { name: 'Sign in' })` | Role/name |
| Sidebar nav | `getByRole('link', { name: 'Dashboard' / 'Report Builder' / 'Theme Studio', exact: true })` | Role/name; expand sidebar first |
| Theme quick toggle | `getByRole('button', { name: /Switch to (Light\|Dark) Mode/ })` | Title/name is state-dependent |
| Theme Studio section | `getByRole('button', { name: /^Theme Settings/ })` | Stable section header |
| Preset | `getByTitle('<label> — applies this colour palette')` | Explicit `title` on each swatch |
| Panel mode toggle | `getByRole('button', { name: /^Switch to (light\|dark)$/i })` | Distinct from header toggle wording |
| Report table/rows | `main table`, last table + `tbody tr` | Two-table sticky layout |
| Filter | `getByRole('button', { name: 'Filter', exact: true })`, panel via `Filter columns` text | No stable test IDs exposed |
| Theme state | `data-theme-mode`, CSS custom properties, `localStorage` | Real mechanism, no guessed `data-theme` attribute |

No test IDs (`data-testid`) are exposed by the app; role/name/title/text locators were preferred over generated MUI classes. The only MUI class used is `.MuiPaper-root` to scope the filter dialog.

## 7. Assumptions and unclear requirements

- The documented expectation is that the theme is a **per-browser preference**; the brief does not require account-level/server-side sync, so the absence of an API is treated as design, not a defect.
- The header intentionally keeps brand background colours in light mode (Global Settings → Header Branding), so it is excluded from light/dark background assertions.
- "Report Module" is interpreted as the `Report Builder` screen (`#/dashboard/reports`), the only Reports destination exposed for this account.
- `Reset to defaults` did not visibly change a previously selected preset during exploration; its exact contract is unclear and is not asserted.
- Cross-tab live synchronisation is not specified; it is recorded as a limitation.
- The staging user has no admin-only screens; validation is limited to the screens available to the supplied general-user account.

## 8. Confirmed defects found during exploration

| ID | Summary | Severity |
|---|---|---|
| DEF-01 | Failed preference write silently diverges UI and storage | Low |
| DEF-02 | Emerald (light) accent text fails WCAG AA contrast | Medium |
| DEF-03 | Unsupported persisted mode blanks the app | High |

Details, reproduction and RCA: `docs/defect-report.md`.
