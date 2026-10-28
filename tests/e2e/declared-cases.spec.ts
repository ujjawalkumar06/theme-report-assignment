import { test } from '@playwright/test';

/**
 * These cases are declared in the CSV but are not executed yet.
 * Keeping them here makes the automation catalogue complete and visible in the report.
 */
test.describe('Declared E2E cases — not run', () => {
  test.skip('E2E-LOGIN-05 - Remember me option [Not Run: preference persistence not verified]', async () => {});

  test.skip('E2E-LOGIN-10 - Email format validation [Not Run: native validation not exercised]', async () => {});

  test.skip('E2E-DASH-08 - Appearance tab [Not Run: dashboard setup tab]', async () => {});

  test.skip('E2E-DASH-09 - Content tab [Not Run: dashboard setup tab]', async () => {});

  test.skip('E2E-GLB-06 - Save global settings [Not Run: would persist branding changes]', async () => {});

  test.skip('E2E-ACC-12 - Save personal information [Not Run: would modify profile data]', async () => {});

  test.skip('E2E-NOT-02 - View all notifications [Not Run]', async () => {});
});
