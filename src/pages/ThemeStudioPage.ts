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
    // The section may be collapsed, or expanded on another tab (My Themes / Mode).
    const presetsTab = this.page.getByRole('button', { name: /Ready-made colour themes/ });
    if ((await presetsTab.count()) === 0) {
      await this.settingsHeader.click();
      await expect(presetsTab, 'Theme Settings tabs should expand').toBeVisible();
    }
    if ((await this.presets.count()) === 0) {
      await presetsTab.click();
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

  /** Changes the brand primary colour (Theme Settings → Colour Settings → Brand). */
  async setBrandPrimaryColor(hex: string): Promise<void> {
    if ((await this.page.locator('input[type="color"]:visible').count()) === 0) {
      await this.page.getByRole('button', { name: /^Colour Settings/ }).first().click();
    }
    await this.page.getByRole('button', { name: /Core brand colours/ }).click();

    const input = this.page.locator('input[type="color"]:visible').first();
    await input.evaluate((element, value) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }, hex);

    await expect
      .poll(async () => (await readThemeSnapshot(this.page)).storedPrimaryHex?.toLowerCase(), {
        message: `Custom primary colour should be persisted as ${hex}`,
      })
      .toBe(hex.toLowerCase());
  }

  /** Opens the My Themes tab, expanding Theme Settings when needed. */
  async openMyThemes(): Promise<void> {
    const myThemesTab = this.page.getByRole('button', { name: /Your saved custom themes/ });
    if ((await myThemesTab.count()) === 0) {
      await this.settingsHeader.click();
      await expect(myThemesTab, 'Theme Settings tabs should expand').toBeVisible();
    }
    await myThemesTab.click();
    await expect(this.page.getByRole('button', { name: /\+ Save/ }).first(), 'My Themes tab should open').toBeVisible();
  }

  /** Saves the current customisations as a named theme (My Themes → + Save). */
  async saveCurrentTheme(name: string): Promise<void> {
    await this.openMyThemes();

    const save = this.page.getByRole('button', { name: /\+ Save/ }).first();
    await expect(save, 'Save should be enabled once the theme is customised').toBeEnabled();
    await save.click();

    const dialog = this.page.getByRole('dialog').filter({ hasText: 'Save theme' });
    await expect(dialog, 'Save theme dialog should open').toBeVisible();
    await dialog.locator('input[type="text"]').first().fill(name);
    await dialog.getByRole('button', { name: /^save$/i }).click();

    await expect(
      this.page.locator('[title="Apply this saved theme"]').filter({ hasText: name }).first(),
      `Saved theme "${name}" should appear in My Themes`,
    ).toBeVisible();
  }

  /** Applies a saved theme by clicking its row in My Themes. */
  async applySavedTheme(name: string): Promise<void> {
    await this.openMyThemes();
    const row = this.page.locator('[title="Apply this saved theme"]').filter({ hasText: name }).first();
    await expect(row, `Saved theme "${name}" should be listed`).toBeVisible();
    await row.click();
  }

  /** Opens Reset to defaults and confirms the destructive action. */
  async resetToDefaults(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reset to defaults' }).first().click();

    const dialog = this.page.getByRole('dialog').filter({ hasText: 'Reset everything?' });
    await expect(dialog, 'Reset confirmation should be shown').toBeVisible();
    await dialog.getByRole('button', { name: /^reset to defaults$/i }).click();

    await expect
      .poll(async () => (await readThemeSnapshot(this.page)).presetId, {
        message: 'Reset should restore the default Emerald preset',
      })
      .toBe('emerald');
  }
}
