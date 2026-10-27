export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function normalizeColor(value: string): string {
  return value.replace(/\s+/g, '').toLowerCase();
}

export function parseColor(value: string): Rgba | null {
  const rgb = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] === undefined ? 1 : Number(rgb[4]),
    };
  }

  // Chromium serialises color-mix()/wide-gamut results as color(srgb r g b / a).
  const srgb = value.match(
    /color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i,
  );
  if (srgb) {
    return {
      r: Number(srgb[1]) * 255,
      g: Number(srgb[2]) * 255,
      b: Number(srgb[3]) * 255,
      a: srgb[4] === undefined ? 1 : Number(srgb[4]),
    };
  }

  const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits = hex[1];
    const expanded =
      digits.length === 3
        ? digits
            .split('')
            .map((digit) => digit + digit)
            .join('')
        : digits;
    return {
      r: parseInt(expanded.slice(0, 2), 16),
      g: parseInt(expanded.slice(2, 4), 16),
      b: parseInt(expanded.slice(4, 6), 16),
      a: 1,
    };
  }

  return null;
}

/** Compares RGB channels, tolerating serialisation differences and tiny rounding. */
export function colorsEquivalent(a: string, b: string, tolerance = 2): boolean {
  const left = parseColor(a);
  const right = parseColor(b);
  if (!left || !right) return false;
  return (
    Math.abs(left.r - right.r) <= tolerance &&
    Math.abs(left.g - right.g) <= tolerance &&
    Math.abs(left.b - right.b) <= tolerance
  );
}

/** Source-over compositing of a (possibly translucent) foreground on a backdrop. */
export function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
    a,
  };
}

export function relativeLuminance(color: Rgba): number {
  const channel = (value: number): number => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

export function contrastRatio(foreground: Rgba, background: Rgba): number {
  const fg = composite(foreground, background);
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastBetween(fg: string, bg: string): number | null {
  const foreground = parseColor(fg);
  const background = parseColor(bg);
  if (!foreground || !background) return null;
  return contrastRatio(foreground, background);
}

export function isDarkColor(value: string): boolean | null {
  const color = parseColor(value);
  if (!color) return null;
  return relativeLuminance(color) < 0.35;
}
