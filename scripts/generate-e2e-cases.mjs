import fs from 'node:fs';
import path from 'node:path';

const rows = [];
const add = (id, module, priority, scenario, pre, steps, data, expected, status) =>
  rows.push({ id, module, priority, scenario, pre, steps, data, expected, status });

// ---------------- Authentication ----------------
add('E2E-LOGIN-01', 'Login', 'P0', 'Valid login', 'Staging reachable', '1. Open /#/login 2. Enter email/password 3. Sign in', 'Env credentials', 'Redirect to dashboard overview; shell visible', 'Pass');
add('E2E-LOGIN-02', 'Login', 'P1', 'Invalid credentials', 'Login page', '1. Enter valid email + wrong password 2. Sign in', 'bad@example.com / WrongPass1', 'Inline error "Incorrect email or password."; no access', 'Pass');
add('E2E-LOGIN-03', 'Login', 'P2', 'Empty fields keep submit disabled', 'Login page', '1. Open login without typing', '—', 'Sign in disabled', 'Pass');
add('E2E-LOGIN-04', 'Login', 'P2', 'Show/Hide password', 'Login page', '1. Enter password 2. Click Show Password 3. Click Hide Password', 'Valid password (from .env)', 'Password toggles text/password; label toggles', 'Pass');
add('E2E-LOGIN-05', 'Login', 'P2', 'Remember me option', 'Login page', '1. Check Remember me 2. Sign in 3. Reload', '—', 'Preference persisted', 'Pass');
add('E2E-LOGIN-06', 'Login', 'P2', 'Forgot password guidance', 'Login page', '1. Hover/click Forgot password?', '—', 'Contact admin guidance shown', 'Pass (observed)');
add('E2E-LOGIN-07', 'Login', 'P1', 'Unauthenticated deep link redirects to login', 'Signed out', '1. Open /#/dashboard/reports', '—', 'Redirect to /#/login', 'Pass');
add('E2E-LOGIN-08', 'Login', 'P1', 'Logout', 'Signed in', '1. Avatar 2. Sign Out', '—', 'Session cleared; login shown; protected routes blocked', 'Pass');
add('E2E-LOGIN-09', 'Login', 'P2', 'Session survives reload', 'Signed in', '1. Reload page', '—', 'Still signed in', 'Pass');
add('E2E-LOGIN-10', 'Login', 'P2', 'Email format validation', 'Login page', '1. Enter invalid email 2. Sign in', 'not-an-email', 'Native validation blocks submit', 'Pass');

// ---------------- Dashboard / shell ----------------
add('E2E-DASH-01', 'Dashboard', 'P0', 'Dashboard loads after login', 'Valid session', '1. Sign in 2. Wait for overview', '—', 'Widgets, sidebar, header render', 'Pass');
add('E2E-DASH-02', 'Dashboard', 'P2', 'Intro overlay dismiss', 'First dashboard load', '1. Click "Click anywhere to skip intro"', '—', 'Overlay disappears; dashboard usable', 'Pass (observed)');
add('E2E-DASH-03', 'Shell', 'P1', 'Sidebar collapse/expand', 'Dashboard', '1. Collapse 2. Expand', '—', 'Sidebar collapses to icons and restores', 'Pass');
add('E2E-DASH-04', 'Shell', 'P2', 'Header controls visible', 'Dashboard', '1. Inspect theme toggle, fullscreen, settings, notifications, account', '—', 'All controls visible and enabled', 'Pass');
add('E2E-DASH-05', 'Shell', 'P2', 'Fullscreen toggle', 'Dashboard', '1. Click Fullscreen 2. Exit', '—', 'Browser fullscreen enters and exits', 'Pass');
add('E2E-DASH-06', 'Shell', 'P2', 'Theme quick toggle', 'Dashboard', '1. Click Switch to Dark/Light Mode', '—', 'Mode changes and persists', 'Pass');
add('E2E-DASH-07', 'Dashboard', 'P2', 'Brand tab', 'Dashboard', '1. Click Brand', '—', 'Brand content visible', 'Pass (observed)');
add('E2E-DASH-08', 'Dashboard', 'P2', 'Appearance tab', 'Dashboard', '1. Click Appearance', '—', 'Appearance content visible', 'Pass');
add('E2E-DASH-09', 'Dashboard', 'P2', 'Content tab', 'Dashboard', '1. Click Content', '—', 'Content options visible', 'Pass');
add('E2E-DASH-10', 'Dashboard', 'P2', 'Dashboard widgets render', 'Dashboard', '1. Inspect metrics/charts/activity', '—', 'Widgets display data', 'Pass');
add('E2E-DASH-11', 'Shell', 'P2', 'Global Settings opens', 'Any page', '1. Click Global Settings', '—', 'Modal with Header/Customer Profile/Footer/Sidebar tabs', 'Pass');
add('E2E-DASH-12', 'Shell', 'P2', 'Notifications opens', 'Any page', '1. Click Notifications', '—', 'Panel with Mentions/Unread/list opens', 'Pass');
add('E2E-DASH-13', 'Shell', 'P2', 'Account menu opens', 'Any page', '1. Click avatar', '—', 'Edit Profile / Sign Out shown', 'Pass');
add('E2E-DASH-14', 'Shell', 'P2', 'Help panel opens', 'Any page', '1. Click ✦', '—', 'Help panel with Dashboard/Page tabs', 'Pass');

// ---------------- Report Module ----------------
add('E2E-RPT-01', 'Report', 'P0', 'Report Module loads', 'Signed in', '1. Sidebar → Report Builder', '—', 'Breadcrumb, toolbar, 1000-row table (15/page) render', 'Pass');
add('E2E-RPT-02', 'Report', 'P1', 'Search filters', 'Report open', '1. Search 2. Enter Ishaan', 'Ishaan', 'Count 1–15 of 50', 'Pass');
add('E2E-RPT-03', 'Report', 'P1', 'Search clears', 'Search applied', '1. Clear search field + Enter', '—', 'Count returns to 1–15 of 1000', 'Pass');
add('E2E-RPT-04', 'Report', 'P1', 'Sort panel lists columns', 'Report open', '1. Sort 2. Add Sort Level 3. Open column list', '—', '13 columns listed', 'Pass');
add('E2E-RPT-05', 'Report', 'P1', 'Sort applies after save', 'Report open', '1. Sort Full name Ascending 2. Close 3. Save changes', 'Full name/Asc', 'Rows reorder (Aditya first)', 'Pass');
add('E2E-RPT-06', 'Report', 'P3', 'Sort Clear all', 'Sort applied', '1. Sort 2. Clear all', '—', 'Panel closes and sort clears', 'Fail (DEF-04)');
add('E2E-RPT-07', 'Report', 'P1', 'Filter panel opens', 'Report open', '1. Filter', '—', 'Filter columns panel with Add condition/group', 'Pass');
add('E2E-RPT-08', 'Report', 'P2', 'Filter condition builder', 'Filter open', '1. Add condition 2. Inspect column/operator/value', '—', 'Condition row with column/operator/value', 'Pass (observed)');
add('E2E-RPT-09', 'Report', 'P2', 'Filter add group requires condition', 'Filter open', '1. Add group before condition', '—', 'Add group disabled/blocked', 'Pass (observed)');
add('E2E-RPT-10', 'Report', 'P2', 'Filter apply and clear', 'Filter open', '1. Add condition 2. Set value 3. Save/close 4. Clear all', 'Status = Full Time', 'Filtered rows; clear restores all', 'Pass');
add('E2E-RPT-11', 'Report', 'P2', 'Show/Hide Columns panel', 'Report open', '1. Show/Hide Columns', '—', 'All (13) and column checkboxes', 'Pass (observed)');
add('E2E-RPT-12', 'Report', 'P2', 'Toggle a column', 'Columns panel open', '1. Toggle Phone number 2. Close', '—', 'Column hidden; restore works', 'Pass');
add('E2E-RPT-13', 'Report', 'P2', 'List view', 'Report open', '1. Click List view', '—', 'Table layout active', 'Pass');
add('E2E-RPT-14', 'Report', 'P2', 'Grid view', 'Report open', '1. Click Grid view', '—', 'Card layout with identity/contact', 'Pass');
add('E2E-RPT-15', 'Report', 'P2', 'Pagination next', 'Report open', '1. Next page', '—', '16–30 of 1000', 'Pass');
add('E2E-RPT-16', 'Report', 'P2', 'Pagination last', 'Report open', '1. Last page', '—', '991–1000, page 67', 'Pass');
add('E2E-RPT-17', 'Report', 'P2', 'Page input jump', 'Report open', '1. Enter page 10 + Enter', '10', 'Shows page 10 range', 'Pass');
add('E2E-RPT-18', 'Report', 'P2', 'Rows-per-page options', 'Report open', '1. Open rows per page', '—', '10/15/25/50/100 listed', 'Pass (observed)');
add('E2E-RPT-19', 'Report', 'P2', 'Rows-per-page change', 'Report open', '1. Select 25', '25', '25 rows displayed; pagination recalculates', 'Pass');
add('E2E-RPT-20', 'Report', 'P1', 'View dropdown', 'Report open', '1. Click Default View', '—', 'Personal Views, Default View, Create New Report View', 'Pass (observed)');
add('E2E-RPT-21', 'Report', 'P2', 'Create new report view form', 'Report open', '1. View → Create New Report View', '—', 'Name, description, 13 columns, Create/Cancel', 'Pass (observed)');
add('E2E-RPT-22', 'Report', 'P2', 'Create report view', 'Form open', '1. Fill name/description 2. Create', 'Unique name', 'View saved and selectable', 'Pass');
add('E2E-RPT-23', 'Report', 'P2', 'More actions menu', 'Report open', '1. More actions', '—', 'Export/Grouping/Audit/Scheduled/Info', 'Pass');
add('E2E-RPT-24', 'Report', 'P1', 'Export dialog formats', 'Report open', '1. More actions → Export → open format', '—', 'PDF, Excel (.xlsx), JSON', 'Pass');
add('E2E-RPT-25', 'Report', 'P1', 'Export PDF', 'Export dialog open', '1. Download PDF', '—', 'PDF downloads', 'Fail (DEF-05: page hangs, no file)');
add('E2E-RPT-26', 'Report', 'P1', 'Export Excel', 'Export dialog open', '1. Select Excel → download', '—', 'XLSX downloads', 'Pass');
add('E2E-RPT-27', 'Report', 'P1', 'Export JSON', 'Export dialog open', '1. Select JSON → download', '—', 'JSON downloads', 'Pass');
add('E2E-RPT-28', 'Report', 'P2', 'Grouping panel', 'Report open', '1. More actions → Grouping', '—', 'Group configuration + column selector', 'Pass (observed)');
add('E2E-RPT-29', 'Report', 'P2', 'Audit history', 'Report open', '1. More actions → Audit History', '—', 'Event list with user/time', 'Pass (observed)');
add('E2E-RPT-30', 'Report', 'P2', 'Scheduled reports empty state', 'Report open', '1. More actions → Scheduled Reports', '—', 'No schedules yet; New schedule', 'Pass (observed)');
add('E2E-RPT-31', 'Report', 'P2', 'New schedule form', 'Scheduled panel', '1. Click New schedule', '—', 'Schedule form opens', 'Pass');
add('E2E-RPT-32', 'Report', 'P2', 'Row actions menu', 'Report open', '1. Row action button', '—', 'View/Edit/Duplicate/Delete', 'Pass (observed)');
add('E2E-RPT-33', 'Report', 'P2', 'Row View', 'Row menu open', '1. View', '—', 'Record detail opens', 'Pass');
add('E2E-RPT-34', 'Report', 'P2', 'New User dialog', 'Report open', '1. New User', '—', 'Add User Details fields', 'Pass (observed)');
add('E2E-RPT-35', 'Report', 'P2', 'New User validation', 'Dialog open', '1. Submit empty', '—', 'Required-field validation', 'Pass');
add('E2E-RPT-36', 'Report', 'P2', 'Create New User', 'Dialog open', '1. Fill fields 2. Create', 'Unique user', 'User added to table', 'Fail (BUG-016: not persisted after reload)');
add('E2E-RPT-37', 'Report', 'P2', 'Table header sort', 'Report open', '1. Click Full name header', '—', 'Sorts asc/desc', 'Pass (observed)');
add('E2E-RPT-38', 'Report', 'P1', 'Report reflects theme', 'Theme set', '1. Open Report', 'Corporate/Dark', 'Tokens match Dashboard', 'Pass');

// ---------------- Theme Studio ----------------
add('E2E-THM-01', 'Theme', 'P0', 'Open Theme Studio', 'Signed in', '1. Sidebar → Theme Studio', '—', 'Theme Settings panel opens', 'Pass');
const presets = ['Corporate Blue', 'Emerald', 'Indigo Violet', 'Graphite', 'Ocean Teal', 'Amber'];
presets.forEach((p, i) => {
  add(`E2E-THM-PRESET-${String(i + 1).padStart(2, '0')}`, 'Theme', 'P1', `Apply preset ${p} (light)`, 'Theme Studio', '1. Presets 2. Select preset 3. Light', p, 'Preset and tokens applied/persisted', 'Pass');
  add(`E2E-THM-PRESET-${String(i + 1).padStart(2, '0')}D`, 'Theme', 'P1', `Apply preset ${p} (dark)`, 'Theme Studio', '1. Presets 2. Select preset 3. Dark', p, 'Preset and tokens applied/persisted', 'Pass');
});
add('E2E-THM-02', 'Theme', 'P1', 'Mode tab light/dark', 'Theme Studio', '1. Mode 2. Select light/dark', '—', 'Mode applies', 'Pass');
add('E2E-THM-03', 'Theme', 'P2', 'My Themes tab', 'Theme Studio', '1. My Themes', '—', 'Empty state/import/download/save', 'Pass');
add('E2E-THM-04', 'Theme', 'P2', 'Save disabled for unmodified preset', 'Theme Studio', '1. My Themes', '—', '+ Save disabled', 'Pass');
add('E2E-THM-05', 'Theme', 'P2', 'Save theme name required', 'My Themes', '1. + Save 2. Submit empty', '—', 'Name required', 'Pass (observed)');
add('E2E-THM-06', 'Theme', 'P1', 'Save custom theme', 'Customised theme', '1. + Save 2. Name 3. Save', 'Automation Theme', 'Theme saved and listed', 'Pass');
add('E2E-THM-07', 'Theme', 'P1', 'Apply saved theme', 'Saved theme', '1. Click saved row', 'Automation Theme', 'Saved tokens restored', 'Pass');
add('E2E-THM-08', 'Theme', 'P2', 'Rename saved theme', 'Saved theme', '1. ⋮ → Rename 2. New name', 'Renamed Theme', 'Name updated', 'Pass (observed)');
add('E2E-THM-09', 'Theme', 'P2', 'Delete saved theme (cancel)', 'Saved theme', '1. ⋮ → Delete 2. Cancel', '—', 'Theme remains', 'Pass (observed)');
add('E2E-THM-10', 'Theme', 'P2', 'Delete saved theme', 'Saved theme', '1. ⋮ → Delete 2. Confirm', '—', 'Theme removed', 'Pass');
add('E2E-THM-11', 'Theme', 'P2', 'Download theme JSON', 'Saved theme', '1. Download', '—', 'theme.json downloads', 'Pass (observed)');
add('E2E-THM-12', 'Theme', 'P2', 'Import theme JSON', 'Saved theme file', '1. Import 2. Choose file', 'theme.json', 'Theme imported', 'Pass');
add('E2E-THM-13', 'Theme', 'P1', 'Reset dialog cancel', 'Theme Studio', '1. Reset 2. Cancel', '—', 'Theme unchanged', 'Pass (observed)');
add('E2E-THM-14', 'Theme', 'P1', 'Reset to defaults', 'Customised theme', '1. Reset 2. Confirm', '—', 'Emerald / Light restored', 'Pass');
add('E2E-THM-15', 'Theme', 'P2', 'Colour Settings Brand', 'Theme Studio', '1. Colour Settings → Brand', '—', 'Primary/secondary/highlight colour inputs', 'Pass');
add('E2E-THM-16', 'Theme', 'P2', 'Colour Settings Text', 'Theme Studio', '1. Colour Settings → Text', '—', 'Heading/body text colours', 'Pass');
add('E2E-THM-17', 'Theme', 'P2', 'Colour Settings Status', 'Theme Studio', '1. Colour Settings → Status', '—', 'Success/warning/info/error + surfaces', 'Pass');
add('E2E-THM-18', 'Theme', 'P2', 'Typography', 'Theme Studio', '1. Typography', '—', 'Body/heading fonts, sizes, weights, upload', 'Pass');
add('E2E-THM-19', 'Theme', 'P2', 'Cards', 'Theme Studio', '1. Cards', '—', 'Style/header/nested/tint', 'Pass');
add('E2E-THM-20', 'Theme', 'P2', 'Tables', 'Theme Studio', '1. Tables', '—', 'Rows/columns/cells/styling; Orders preview', 'Pass');
add('E2E-THM-21', 'Theme', 'P2', 'Surface & Shape', 'Theme Studio', '1. Surface & Shape', '—', 'Shape/effects', 'Pass');
add('E2E-THM-22', 'Theme', 'P2', 'Notifications', 'Theme Studio', '1. Notifications', '—', 'Placement/behaviour', 'Pass');
add('E2E-THM-23', 'Theme', 'P2', 'Login Screen', 'Theme Studio', '1. Login Screen', '—', 'Image/logo/panel colour', 'Pass');
add('E2E-THM-24', 'Theme', 'P2', 'Preview screens', 'Theme Studio', '1. Change preview screen', '—', 'Dashboard/Operations/Cameras/Reports/Orders/Components', 'Pass');
add('E2E-THM-25', 'Theme', 'P2', 'Preview zoom', 'Theme Studio', '1. Open zoom', '—', 'Fit + manual zoom options', 'Pass (observed)');
add('E2E-THM-26', 'Theme', 'P1', 'Custom brand colour persists', 'Theme Studio', '1. Set #123456 2. Reload', '#123456', 'Custom id/primary persist', 'Pass');
add('E2E-THM-27', 'Theme', 'P1', 'Theme persists on Report reload', 'Theme set', '1. Reload Report', 'Corporate/Dark', 'Theme unchanged', 'Pass');
add('E2E-THM-28', 'Theme', 'P1', 'New tab inherits theme', 'Theme set', '1. New tab 2. Sign in 3. Report', 'Corporate/Dark', 'Theme applied', 'Pass');
add('E2E-THM-29', 'Theme', 'P2', 'Default theme on first visit', 'Fresh context', '1. Sign in 2. Report', '—', 'Consistent Emerald/Light', 'Pass');
add('E2E-THM-30', 'Theme', 'P1', 'Unsupported preset fallback', 'Theme persisted', '1. Set unsupported preset 2. Reload', 'unsupported-preset', 'App usable with fallback', 'Pass');
add('E2E-THM-31', 'Theme', 'P0', 'Unsupported mode', 'Theme persisted', '1. Set mode=sepia 2. Reload', 'sepia', 'App usable with fallback', 'Fail (DEF-03)');
add('E2E-THM-32', 'Theme', 'P1', 'Failed preference write', 'Theme persisted', '1. Break localStorage.setItem 2. Toggle mode', '—', 'No silent divergence', 'Fail (DEF-01)');
add('E2E-THM-33', 'Theme', 'P1', 'Accent contrast light', 'Emerald/Light', '1. Measure Report accent text', '#10B981', '>= 4.5:1', 'Fail (DEF-02)');

// ---------------- Global settings / account ----------------
add('E2E-GLB-01', 'Global Settings', 'P2', 'Header tab', 'Global Settings open', '1. Header', '—', 'Logo/company/header background', 'Pass (observed)');
add('E2E-GLB-02', 'Global Settings', 'P2', 'Customer Profile tab', 'Global Settings open', '1. Customer Profile', '—', 'Logo/name/caption/text colour', 'Pass (observed)');
add('E2E-GLB-03', 'Global Settings', 'P2', 'Footer tab', 'Global Settings open', '1. Footer', '—', 'Powered by/caption/copyright/links', 'Pass (observed)');
add('E2E-GLB-04', 'Global Settings', 'P2', 'Sidebar tab', 'Global Settings open', '1. Sidebar', '—', 'Behaviour/dimensions', 'Pass (observed)');
add('E2E-GLB-05', 'Global Settings', 'P2', 'Add footer link', 'Footer tab', '1. Add Link', '—', 'Link row added', 'Pass (open only)');
add('E2E-GLB-06', 'Global Settings', 'P2', 'Save global settings', 'Any tab', '1. Change a value 2. Save', '—', 'Value persists', 'Pass');
add('E2E-ACC-01', 'Account Settings', 'P2', 'Account Settings page', 'Signed in', '1. Sidebar → Account Settings', '—', 'Personal Information/Preferences sections', 'Pass');
add('E2E-ACC-02', 'Account Settings', 'P2', 'Personal information fields', 'Account page', '1. Inspect name/role/email/phone/department/organization', '—', 'Fields rendered', 'Pass');
add('E2E-ACC-03', 'Account Settings', 'P2', 'Preferences & privacy', 'Account page', '1. Inspect cookies/language/timezone', '—', 'Controls rendered', 'Pass');
add('E2E-ACC-04', 'Account Settings', 'P2', 'Cookie preferences', 'Account page', '1. Click Cookie Preferences', '—', 'Preference dialog opens', 'Pass (observed)');
add('E2E-ACC-05', 'Account Settings', 'P2', 'Language selector', 'Account page', '1. Open language', '—', 'Language options', 'Pass (observed)');
add('E2E-ACC-06', 'Account Settings', 'P2', 'Timezone selector', 'Account page', '1. Open timezone', '—', 'Timezone options', 'Pass (observed)');
add('E2E-ACC-07', 'Account Settings', 'P2', 'Active sessions', 'Account page', '1. Click Active Sessions', '—', 'Session list opens', 'Pass (observed)');
add('E2E-ACC-08', 'Account Settings', 'P2', 'Login history', 'Account page', '1. Click Login History', '—', 'History list opens', 'Pass (observed)');
add('E2E-ACC-09', 'Account Settings', 'P2', 'Advanced settings', 'Account page', '1. Click Advanced Settings', '—', 'Advanced panel opens', 'Pass (observed)');
add('E2E-ACC-10', 'Account Settings', 'P2', 'Backup & reset', 'Account page', '1. Click Backup & Reset', '—', 'Backup/reset options', 'Pass (open only)');
add('E2E-ACC-11', 'Account Settings', 'P2', 'Edit profile', 'Account menu', '1. Edit Profile', '—', 'Profile editor opens', 'Pass');
add('E2E-ACC-12', 'Account Settings', 'P2', 'Save personal information', 'Account page', '1. Edit a field 2. Save', '—', 'Value persists', 'Pass');
add('E2E-NOT-01', 'Notifications', 'P2', 'Notifications panel', 'Any page', '1. Bell', '—', 'Mentions/Unread list', 'Pass (observed)');
add('E2E-NOT-02', 'Notifications', 'P2', 'View all notifications', 'Panel open', '1. View all', '—', 'Full notification view', 'Pass');
add('E2E-HELP-01', 'Help', 'P2', 'Help panel tabs', 'Any page', '1. ✦ 2. Dashboard/Page tabs', '—', 'Contextual help shown', 'Pass (observed)');
add('E2E-FLOW-01', 'End-to-End', 'P0', 'Full journey', 'Fresh session', '1. Login 2. Theme 3. Report 4. Search 5. Paginate 6. Grid/List 7. Export 8. Reset', 'Corporate/Dark; Ishaan', 'Journey completes; theme consistent; Report usable', 'Pass (export blocked)');

const header = ['Test Case ID', 'Module', 'Priority', 'Scenario', 'Pre-conditions', 'Test Steps', 'Test Data', 'Expected Result', 'Status'];
const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const csv = [header, ...rows.map((r) => [r.id, r.module, r.priority, r.scenario, r.pre, r.steps, r.data, r.expected, r.status])]
  .map((line) => line.map(escape).join(','))
  .join('\n');

const target = path.resolve('docs/e2e-test-cases.csv');
fs.writeFileSync(target, `${csv}\n`);
console.log(`Wrote ${rows.length} cases to ${target}`);
