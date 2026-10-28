# E2E test cases

The canonical, spreadsheet-ready catalogue is **`docs/e2e-test-cases.csv`** (129 cases).
It uses the requested columns:

`Test Case ID | Module | Priority | Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Status`

**Current status:** 105 Pass · 4 Fail (DEF-01…DEF-04) · 1 Blocked (PDF export in headless Chromium) · 19 Not Run.

- Automation mapping: `docs/e2e-automation-map.md`
- Defect details and RCA: `docs/defect-report.md`
- Regenerate the CSV: `npm run e2e:csv`
