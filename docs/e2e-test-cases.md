# E2E test cases

The canonical, spreadsheet-ready catalogue is **`docs/e2e-test-cases.csv`** (129 cases).
It uses the requested columns:

`Test Case ID | Module | Priority | Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Status`

**Current status:** 123 Pass · 6 Fail (DEF-01…DEF-05 + BUG-016) · 0 Blocked · 0 Not Run.

All previously Not Run/Blocked cases were executed on 2026-10-28. PDF export is now a confirmed defect (DEF-05); Excel and JSON download correctly. New-user creation is confirmed as non-persistent after reload (BUG-016).

- Automation mapping: `docs/e2e-automation-map.md`
- Defect details and RCA: `docs/defect-report.md`
- Regenerate the CSV: `npm run e2e:csv`
