import { type Page, expect } from '@playwright/test';
import { MODE_TOKENS, type PresetDefinition, type ThemeMode } from '../config/themes';
import { colorsEquivalent, normalizeColor } from './color';

export const THEME_STORAGE_KEY = 'omnieye-theme-studio';

export interface ThemeSnapshot {
  mode: 'light' | 'dark' | null;
  presetId: string | null;
  storedMode: string | null;
  storedPrimaryHex: string | null;
  storedSecondaryHex: string | null;
  pageBg: string;
  textMain: string;
  primary: string;
  secondary: string;
  cardBg: string;
  borderLight: string;
  bodyBg: string;
  bodyColor: string;
}

/** Reads the real theme state: <html> attribute, resolved CSS variables and persisted settings. */
export async function readThemeSnapshot(page: Page): Promise<ThemeSnapshot> {
  return page.evaluate((storageKey) => {
    const root = document.documentElement;
    const rootStyle = getComputedStyle(root);
    const bodyStyle = getComputedStyle(document.body);

    let settings: Record<string, unknown> | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { settings?: Record<string, unknown> } };
        settings = parsed.state?.settings ?? null;
      }
    } catch {
      settings = null;
    }

    const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

    return {
      mode: (root.getAttribute('data-theme-mode') as 'light' | 'dark' | null) ?? null,
      presetId: asString(settings?.presetId),
      storedMode: asString(settings?.mode),
      storedPrimaryHex: asString(settings?.primaryHex),
      storedSecondaryHex: asString(settings?.secondaryHex),
      pageBg: rootStyle.getPropertyValue('--page-bg').trim(),
      textMain: rootStyle.getPropertyValue('--text-main').trim(),
      primary: rootStyle.getPropertyValue('--primary').trim(),
      secondary: rootStyle.getPropertyValue('--secondary').trim(),
      cardBg: rootStyle.getPropertyValue('--bg-card').trim(),
      borderLight: rootStyle.getPropertyValue('--border-light').trim(),
      bodyBg: bodyStyle.backgroundColor,
      bodyColor: bodyStyle.color,
    };
  }, THEME_STORAGE_KEY);
}

export interface ThemeFingerprint {
  mode: string | null;
  pageBg: string;
  textMain: string;
  primary: string;
  secondary: string;
  cardBg: string;
  borderLight: string;
}

export function fingerprint(snapshot: ThemeSnapshot): ThemeFingerprint {
  return {
    mode: snapshot.mode,
    pageBg: normalizeColor(snapshot.pageBg),
    textMain: normalizeColor(snapshot.textMain),
    primary: normalizeColor(snapshot.primary),
    secondary: normalizeColor(snapshot.secondary),
    cardBg: normalizeColor(snapshot.cardBg),
    borderLight: normalizeColor(snapshot.borderLight),
  };
}

/**
 * Asserts that the selected preset and mode are applied and persisted.
 * Values come from documented observations (docs/exploration.md), not guesses.
 */
export async function assertThemeApplied(
  page: Page,
  preset: PresetDefinition,
  mode: ThemeMode,
): Promise<ThemeSnapshot> {
  const expected = MODE_TOKENS[mode];
  const resolved = preset.resolved[mode];

  await expect
    .poll(async () => (await readThemeSnapshot(page)).mode, {
      message: `Theme mode should be "${mode}" for ${preset.display}`,
    })
    .toBe(expected.attr);

  const snapshot = await readThemeSnapshot(page);

  expect(snapshot.presetId, `Persisted preset should be "${preset.key}"`).toBe(preset.key);
  expect(snapshot.storedMode, `Persisted mode should be "${mode}"`).toBe(mode);
  expect(
    snapshot.storedPrimaryHex?.toLowerCase(),
    'Persisted primary colour should match the preset',
  ).toBe(preset.primaryHex.toLowerCase());
  expect(
    snapshot.storedSecondaryHex?.toLowerCase(),
    'Persisted secondary colour should match the preset',
  ).toBe(preset.secondaryHex.toLowerCase());

  expect(normalizeColor(snapshot.pageBg), 'Resolved --page-bg should match the mode').toBe(
    normalizeColor(expected.pageBg),
  );
  expect(normalizeColor(snapshot.textMain), 'Resolved --text-main should match the mode').toBe(
    normalizeColor(expected.textMain),
  );
  expect(normalizeColor(snapshot.primary), 'Resolved --primary should match the preset/mode').toBe(
    normalizeColor(resolved.primary),
  );
  expect(normalizeColor(snapshot.secondary), 'Resolved --secondary should match the preset/mode').toBe(
    normalizeColor(resolved.secondary),
  );
  expect(
    colorsEquivalent(snapshot.bodyBg, expected.pageBg),
    `Page body background (${snapshot.bodyBg}) should follow --page-bg (${expected.pageBg})`,
  ).toBe(true);

  return snapshot;
}

export function expectSameTheme(
  actual: ThemeFingerprint,
  expected: ThemeFingerprint,
  context: string,
): void {
  expect(actual, `${context}: resolved theme tokens should not change between modules`).toEqual(expected);
}

async function mutatePersistedSettings(
  page: Page,
  patch: Record<string, unknown>,
): Promise<void> {
  await page.evaluate(
    ({ storageKey, values }) => {
      const raw = localStorage.getItem(storageKey);
      if (!raw) throw new Error('Theme settings are not initialised; cannot seed unsupported values');
      const parsed = JSON.parse(raw) as { state: { settings: Record<string, unknown> } };
      Object.assign(parsed.state.settings, values);
      localStorage.setItem(storageKey, JSON.stringify(parsed));
    },
    { storageKey: THEME_STORAGE_KEY, values: patch },
  );
}

/** Fault injection: unsupported mode with an otherwise valid preset. */
export async function seedUnsupportedMode(page: Page): Promise<void> {
  await mutatePersistedSettings(page, { mode: 'sepia' });
}

/** Fault injection: unsupported preset with an otherwise valid mode. */
export async function seedUnsupportedPreset(page: Page): Promise<void> {
  await mutatePersistedSettings(page, { presetId: 'unsupported-preset' });
}

/** Fault injection: every localStorage write now throws, simulating a failed preference update. */
export async function breakThemePersistence(page: Page): Promise<void> {
  await page.evaluate(() => {
    Storage.prototype.setItem = function setItem(): void {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    };
  });
}
