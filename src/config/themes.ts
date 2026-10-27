/**
 * Theme test data discovered from the staging application (see docs/exploration.md).
 *
 * The app keeps the selected preset/mode in localStorage under `omnieye-theme-studio`
 * and exposes the resolved values as CSS custom properties on <html>. In light mode the
 * resolved --primary equals the preset's primaryHex; in dark mode the app resolves a
 * lighter accessible variant, so both values are captured here.
 */
export type ThemeMode = 'light' | 'dark';

export interface PresetDefinition {
  /** Value stored as settings.presetId. */
  key: string;
  /** Human readable label used by the Theme Studio UI. */
  display: string;
  primaryHex: string;
  secondaryHex: string;
  /** CSS custom property values resolved by the app for each mode. */
  resolved: Record<ThemeMode, { primary: string; secondary: string }>;
}

export const MODE_TOKENS: Record<
  ThemeMode,
  { attr: 'light' | 'dark'; pageBg: string; textMain: string; bodyBg: string; cardBg: string }
> = {
  light: {
    attr: 'light',
    pageBg: '#ffffff',
    textMain: 'rgba(0, 0, 0, 0.92)',
    bodyBg: 'rgb(255, 255, 255)',
    cardBg: '#ffffff',
  },
  dark: {
    attr: 'dark',
    pageBg: '#121212',
    textMain: 'rgba(255, 255, 255, 0.96)',
    bodyBg: 'rgb(18, 18, 18)',
    cardBg: '#212121',
  },
};

export const PRESETS: Record<string, PresetDefinition> = {
  corporate: {
    key: 'corporate',
    display: 'Corporate Blue',
    primaryHex: '#4F6BFF',
    secondaryHex: '#22D3EE',
    resolved: {
      light: { primary: '#4F6BFF', secondary: '#22D3EE' },
      dark: { primary: '#7d8fe8', secondary: '#85d4e0' },
    },
  },
  emerald: {
    key: 'emerald',
    display: 'Emerald',
    primaryHex: '#10B981',
    secondaryHex: '#F5A524',
    resolved: {
      light: { primary: '#10B981', secondary: '#F5A524' },
      dark: { primary: '#85e0c2', secondary: '#e3be82' },
    },
  },
  indigo: {
    key: 'indigo',
    display: 'Indigo Violet',
    primaryHex: '#A97BFF',
    secondaryHex: '#FF5FA2',
    resolved: {
      light: { primary: '#A97BFF', secondary: '#FF5FA2' },
      dark: { primary: '#a27de8', secondary: '#e87daa' },
    },
  },
  slate: {
    key: 'slate',
    display: 'Graphite',
    primaryHex: '#455a64',
    secondaryHex: '#78909c',
    resolved: {
      light: { primary: '#455a64', secondary: '#78909c' },
      dark: { primary: '#a3b8c2', secondary: '#a3b8c2' },
    },
  },
  teal: {
    key: 'teal',
    display: 'Ocean Teal',
    primaryHex: '#00838f',
    secondaryHex: '#0277bd',
    resolved: {
      light: { primary: '#00838f', secondary: '#0277bd' },
      dark: { primary: '#7ddfe8', secondary: '#7ec1e7' },
    },
  },
  amber: {
    key: 'amber',
    display: 'Amber',
    primaryHex: '#e65100',
    secondaryHex: '#d84315',
    resolved: {
      light: { primary: '#e65100', secondary: '#d84315' },
      dark: { primary: '#e8a27d', secondary: '#de9b87' },
    },
  },
};

/** Primary theme used by the main happy-path scenarios. */
export const PRIMARY_THEME = { preset: PRESETS.corporate, mode: 'dark' as ThemeMode };
/** Second theme used to prove the latest selection wins. */
export const SECONDARY_THEME = { preset: PRESETS.emerald, mode: 'light' as ThemeMode };

export function presetByKey(key: string): PresetDefinition {
  const preset = PRESETS[key];
  if (!preset) {
    throw new Error(`Unknown preset key "${key}". Known: ${Object.keys(PRESETS).join(', ')}`);
  }
  return preset;
}
