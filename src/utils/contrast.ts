import { type Page } from '@playwright/test';

export interface ContrastFinding {
  text: string;
  tag: string;
  className: string;
  color: string;
  background: string;
  ratio: number;
}

/**
 * Audits visible leaf text under a root selector.
 * Elements painted on gradients/images are skipped because their true backdrop
 * cannot be derived reliably from computed styles.
 */
export async function auditTextContrast(
  page: Page,
  rootSelector: string,
  minRatio: number,
): Promise<ContrastFinding[]> {
  return page.evaluate(
    ([selector, minimum]) => {
      interface Rgba {
        r: number;
        g: number;
        b: number;
        a: number;
      }

      const parse = (value: string): Rgba | null => {
        const rgb = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
        if (rgb) {
          return {
            r: Number(rgb[1]),
            g: Number(rgb[2]),
            b: Number(rgb[3]),
            a: rgb[4] === undefined ? 1 : Number(rgb[4]),
          };
        }
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
        return null;
      };

      const composite = (fg: Rgba, bg: Rgba): Rgba => {
        const a = fg.a + bg.a * (1 - fg.a);
        if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
        return {
          r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
          g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
          b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
          a,
        };
      };

      const luminance = (color: Rgba): number => {
        const channel = (value: number): number => {
          const v = value / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
      };

      const ratio = (fg: Rgba, bg: Rgba): number => {
        const composed = composite(fg, bg);
        const l1 = luminance(composed);
        const l2 = luminance(bg);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };

      const background = (element: Element): Rgba | null => {
        let node: Element | null = element;
        while (node && node !== document.documentElement) {
          const style = getComputedStyle(node);
          if (style.backgroundImage !== 'none') return null;
          const color = parse(style.backgroundColor);
          if (color && color.a > 0.5) return color;
          node = node.parentElement;
        }
        return parse(getComputedStyle(document.body).backgroundColor) ?? { r: 255, g: 255, b: 255, a: 1 };
      };

      const root = document.querySelector(selector);
      if (!root) return [];

      const findings: ContrastFinding[] = [];
      for (const element of Array.from(root.querySelectorAll('*'))) {
        if (element.children.length > 0) continue;
        const text = (element.textContent ?? '').trim();
        if (!text) continue;
        if (element.closest('[aria-hidden="true"]')) continue;
        if (!element.getClientRects().length) continue;

        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;

        const foreground = parse(style.color);
        if (!foreground) continue;
        const backdrop = background(element);
        if (!backdrop) continue;

        const value = ratio(foreground, backdrop);
        if (value < minimum) {
          findings.push({
            text: text.slice(0, 60),
            tag: element.tagName.toLowerCase(),
            className: (element.className ?? '').toString().slice(0, 80),
            color: style.color,
            background: `rgb(${Math.round(backdrop.r)}, ${Math.round(backdrop.g)}, ${Math.round(backdrop.b)})`,
            ratio: Number(value.toFixed(2)),
          });
        }
      }
      return findings;
    },
    [rootSelector, minRatio] as const,
  );
}
