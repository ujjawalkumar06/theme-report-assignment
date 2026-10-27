import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../config/env';
import { type PresetDefinition, type ThemeMode } from '../config/themes';
import { readThemeSnapshot } from '../utils/theme';

/**
 * Theme Studio is a full-screen route (`#/dashboard/reports?themeStudio=true`).
 * Presets live under the collapsible "Theme Settings" section; the selected
 * preset and mode are persisted immediately to localStorage.
 */
export class ThemeStudioPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get settingsHeader(): Locator {
    return this.page.getByRole('button', { name: /^Theme Settings/ }).first();
  }

  get presets(): Locator {
    return this.page.locator('[title*="applies this colour palette"]');
  }

  get modeToggle(): Locator {
    return this.page.getByRole('button', { name: /^Switch to (light|dark)$/i });
  }

  presetItem(display: string): Locator {
    return this.page.getByTitle(`${display} — applies this colour palette`, { exact: true });
  }

  async open(): Promise<void> {
    await this.ensureSidebarExpanded();
    await this.themeStudioNav.click();
    await expect(this.page).toHaveURL(/themeStudio=true/);
    await expect(this.settingsHeader, 'Theme Studio should open on Theme Settings').toBeVisible();
  }

  async ensureSettingsExpanded(): Promise<void> {
    if ((await this.presets.count()) === 0) {
      await this.settingsHeader.click();
    }
    await expect(this.presets.first(), 'Theme preset list should be visible').toBeVisible();
  }

  async selectPreset(preset: PresetDefinition): Promise<void> {
    await this.ensureSettingsExpanded();
    const item = this.presetItem(preset.display);
    await expect(item, `Preset "${preset.display}" should be offered by Theme Studio`).toBeVisible();
    await item.click();
    await expect
      .poll(async () => (await readThemeSnapshot(this.page)).presetId, {
        message: `Preset "${preset.display}" should be persisted after selection`,
      })
      .toBe(preset.key);
  }

  async setMode(mode: ThemeMode): Promise<void> {
    if ((await this.currentThemeMode()) !== mode) {
      await expect(this.modeToggle, 'Theme Studio mode toggle should be available').toBeVisible();
      await this.modeToggle.click();
    }
    await expect
      .poll(() => this.currentThemeMode(), {
        message: `Application mode should become "${mode}"`,
      })
      .toBe(mode);
  }

  /** Selects a preset and mode, then leaves Theme Studio on the requested page. */
  async applyTheme(preset: PresetDefinition, mode: ThemeMode): Promise<void> {
    await this.open();
    await this.selectPreset(preset);
    await this.setMode(mode);

    const snapshot = await readThemeSnapshot(this.page);
    expect(snapshot.presetId, 'Selected preset should be persisted').toBe(preset.key);
    expect(snapshot.storedMode, 'Selected mode should be persisted').toBe(mode);
    expect(snapshot.mode, 'Selected mode should be applied to the document').toBe(mode);
  }

  async close(returnTo: 'dashboard' | 'report'): Promise<void> {
    const route = returnTo === 'dashboard' ? ROUTES.dashboard : ROUTES.reports;
    await this.page.goto(route);
    await expect(this.page, 'Leaving Theme Studio should restore the report or dashboard route').not.toHaveURL(
      /themeStudio=true/,
    );
  }
}
