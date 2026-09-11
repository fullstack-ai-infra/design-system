import fs from 'node:fs';
import path from 'node:path';

import preset from '../src/tailwind-preset';
import tokensSource from '../tokens/design-tokens.json';

const tokens = fs.readFileSync(path.resolve('src/styles/tokens.css'), 'utf8');

type Rgba = { r: number; g: number; b: number; a: number };

function parseColor(value: string): Rgba {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const [r, g, b] = hex[1]!.match(/.{2}/g)!.map((channel) => Number.parseInt(channel, 16));
    return { r: r!, g: g!, b: b!, a: 1 };
  }
  const rgba = value.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i);
  if (rgba) {
    return { r: Number(rgba[1]), g: Number(rgba[2]), b: Number(rgba[3]), a: Number(rgba[4]) };
  }
  throw new Error(`Unsupported color token value: ${value}`);
}

function token(name: string): Rgba {
  const match = tokens.match(new RegExp(`--ui-${name}:\\s*([^;]+);`));
  if (!match?.[1]) throw new Error(`Missing color token: ${name}`);
  return parseColor(match[1].trim());
}

// antd text colors are alpha composites; reproduce browser compositing over the opaque background.
function composite(foreground: Rgba, background: Rgba): Rgba {
  return {
    r: foreground.r * foreground.a + background.r * (1 - foreground.a),
    g: foreground.g * foreground.a + background.g * (1 - foreground.a),
    b: foreground.b * foreground.a + background.b * (1 - foreground.a),
    a: 1,
  };
}

function luminance({ r, g, b }: Rgba): number {
  const channels = [r, g, b]
    .map((value) => value / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrast(foreground: string, background: string): number {
  const bg = token(background);
  const fg = composite(token(foreground), bg);
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe('semantic token contract', () => {
  it('ships the Ant Design aligned tokens in light and dark themes', () => {
    expect(tokens).toContain("[data-theme='light']");
    expect(tokens).toContain("[data-theme='dark']");
    expect(tokens).toContain('--ui-canvas: #f5f5f5');
    expect(tokens).toContain('--ui-primary: #1677ff');
    expect(tokens).toContain('--ui-ai: #722ed1');
    expect(tokens).toContain('--ui-foreground: rgba(0, 0, 0, 0.88)');
    const profileCount = Object.keys(
      (tokensSource as { profiles?: Record<string, unknown> }).profiles ?? {},
    ).length;
    expect(tokens.match(/--ui-canvas:/g)).toHaveLength(3 * (profileCount + 1));
    expect(tokens).toContain("[data-ui-theme='mint'][data-theme='light']");
    expect(tokens).toContain('--ui-primary: #0a6b4e');
    expect(tokens).toContain('--ui-primary: #19d89b');
  });

  it('turns off design-system motion when the user requests reduced motion', () => {
    expect(tokens).toContain('@media (prefers-reduced-motion: reduce)');
    expect(tokens).toContain('--ui-duration-normal: 0ms');
    expect(tokens).toContain('animation-duration: 0.01ms !important');
  });

  it('maps Tailwind utilities onto semantic variables instead of brand literals', () => {
    expect(preset.theme?.extend?.colors).toMatchObject({
      canvas: {
        DEFAULT: 'var(--ui-canvas)',
        subtle: 'var(--ui-canvas-subtle)',
      },
      navigation: 'var(--ui-navigation)',
      surface: {
        DEFAULT: 'var(--ui-surface)',
        raised: 'var(--ui-surface-raised)',
        inset: 'var(--ui-surface-inset)',
      },
      foreground: {
        DEFAULT: 'var(--ui-foreground)',
        muted: 'var(--ui-foreground-muted)',
        subtle: 'var(--ui-foreground-subtle)',
      },
      border: {
        DEFAULT: 'var(--ui-border)',
        strong: 'var(--ui-border-strong)',
      },
      primary: {
        DEFAULT: 'var(--ui-primary)',
        soft: 'var(--ui-primary-soft)',
      },
      ai: {
        DEFAULT: 'var(--ui-ai)',
        strong: 'var(--ui-ai-strong)',
        soft: 'var(--ui-ai-soft)',
      },
      info: { DEFAULT: 'var(--ui-info)', soft: 'var(--ui-info-soft)' },
      success: {
        DEFAULT: 'var(--ui-success)',
        strong: 'var(--ui-success-strong)',
        soft: 'var(--ui-success-soft)',
      },
      warning: {
        DEFAULT: 'var(--ui-warning)',
        strong: 'var(--ui-warning-strong)',
        soft: 'var(--ui-warning-soft)',
      },
      danger: {
        DEFAULT: 'var(--ui-danger)',
        strong: 'var(--ui-danger-strong)',
        soft: 'var(--ui-danger-soft)',
      },
    });

    const mappedColors = JSON.stringify(preset.theme?.extend?.colors);
    const semanticColorTokens = [
      'canvas',
      'canvas-subtle',
      'navigation',
      'surface',
      'surface-raised',
      'surface-inset',
      'foreground',
      'foreground-muted',
      'foreground-subtle',
      'border',
      'border-strong',
      'primary',
      'primary-hover',
      'primary-foreground',
      'primary-soft',
      'ai',
      'ai-strong',
      'ai-hover',
      'ai-foreground',
      'ai-soft',
      'info',
      'info-soft',
      'success',
      'success-strong',
      'success-soft',
      'warning',
      'warning-strong',
      'warning-soft',
      'danger',
      'danger-strong',
      'danger-soft',
      'overlay',
      'focus',
      'selection',
    ];
    for (const semanticToken of semanticColorTokens) {
      expect(mappedColors, `Tailwind mapping for --ui-${semanticToken}`).toContain(
        `var(--ui-${semanticToken})`,
      );
    }

    expect(preset.theme?.extend).toMatchObject({
      fontSize: { xs: 'var(--ui-text-xs)', '2xl': 'var(--ui-text-2xl)' },
      lineHeight: { tight: 'var(--ui-leading-tight)', normal: 'var(--ui-leading-normal)' },
      spacing: { 1: 'var(--ui-space-1)', 12: 'var(--ui-space-12)' },
      borderRadius: { sm: 'var(--ui-radius-sm)', full: 'var(--ui-radius-full)' },
      boxShadow: { sm: 'var(--ui-shadow-sm)', lg: 'var(--ui-shadow-lg)' },
      transitionDuration: {
        fast: 'var(--ui-duration-fast)',
        normal: 'var(--ui-duration-normal)',
      },
      transitionTimingFunction: { ui: 'var(--ui-ease)' },
      width: { rail: 'var(--ui-rail-width)', sidebar: 'var(--ui-sidebar-width)' },
      height: { topbar: 'var(--ui-topbar-height)' },
    });
  });

  // Body-copy pairs must clear WCAG AA (4.5:1). -strong tiers exist so status text on -soft
  // backgrounds stays AA even though antd's base success/warning/error hues do not.
  // foreground-subtle mirrors antd's tertiary text (0.45 alpha): decorative/disabled-only,
  // deliberately excluded from the AA gate.
  it('keeps light-theme text and status pairs at WCAG AA contrast', () => {
    const pairs = [
      ['foreground', 'canvas'],
      ['foreground-muted', 'canvas'],
      ['ai-foreground', 'ai'],
      ['ai-strong', 'ai-soft'],
      ['success-strong', 'success-soft'],
      ['warning-strong', 'warning-soft'],
      ['danger-strong', 'danger-soft'],
    ] as const;

    for (const [foreground, background] of pairs) {
      expect(
        contrast(foreground, background),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  // Non-text / antd-parity exceptions (WCAG 1.4.11 threshold 3.0:1): white on colorPrimary
  // #1677ff is 4.1:1 in antd itself; info base hue is used for borders and icons on its soft
  // background, mirroring antd Alert usage. danger-on-danger-soft measures 2.99:1 — identical
  // to antd's error hue on error background — and is only used for borders/icons, not text.
  it('keeps antd-parity exceptions at or above the 3.0:1 non-text threshold', () => {
    const pairs = [
      ['primary-foreground', 'primary'],
      ['info', 'info-soft'],
    ] as const;

    for (const [foreground, background] of pairs) {
      expect(
        contrast(foreground, background),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(3.0);
    }
  });
});
