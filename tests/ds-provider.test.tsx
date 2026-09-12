import { render, screen } from '@testing-library/react';

import {
  DSProvider,
  dsAiTokens,
  dsSeedTokens,
  dsThemeProfiles,
  getDSAiTokens,
  getDSSeedTokens,
  getDSThemeToken,
} from '../src';
import tokens from '../tokens/design-tokens.json';

type TokenEntry = { $value: { light: string; dark: string } | string };

function tokenValue(path: string[], mode: 'light' | 'dark') {
  let node: unknown = tokens.tokens;
  for (const key of path) {
    node = (node as Record<string, unknown>)[key];
  }
  const value = (node as TokenEntry).$value;
  return typeof value === 'string' ? value : value[mode];
}

describe('DSProvider', () => {
  it('keeps antd seed tokens identical to tokens/design-tokens.json', () => {
    for (const mode of ['light', 'dark'] as const) {
      const seed = dsSeedTokens[mode];
      expect(seed.colorPrimary).toBe(tokenValue(['color', 'primary'], mode));
      expect(seed.colorInfo).toBe(tokenValue(['color', 'info'], mode));
      expect(seed.colorSuccess).toBe(tokenValue(['color', 'success'], mode));
      expect(seed.colorWarning).toBe(tokenValue(['color', 'warning'], mode));
      expect(seed.colorError).toBe(tokenValue(['color', 'danger'], mode));
      expect(seed.borderRadius).toBe(6);
      expect(seed.fontSize).toBe(14);
    }
  });

  it('keeps the AI purple reserved tokens aligned with the token source', () => {
    for (const mode of ['light', 'dark'] as const) {
      const ai = dsAiTokens[mode];
      expect(ai.colorPrimary).toBe(tokenValue(['color', 'ai'], mode));
      expect(ai.colorPrimaryHover).toBe(tokenValue(['color', 'ai-hover'], mode));
      expect(ai.colorPrimaryActive).toBe(tokenValue(['color', 'ai-strong'], mode));
    }
  });

  it('derives the mint profile CSS and Antd values from the token source', () => {
    expect(dsThemeProfiles).toContain('mint');

    for (const mode of ['light', 'dark'] as const) {
      const seed = getDSSeedTokens('mint', mode);
      const ai = getDSAiTokens('mint', mode);
      expect(seed.colorPrimary).toBe(getDSThemeToken('mint', mode, 'color', 'primary'));
      expect(seed.colorSuccess).toBe(getDSThemeToken('mint', mode, 'color', 'success'));
      expect(seed.colorError).toBe(getDSThemeToken('mint', mode, 'color', 'danger'));
      expect(ai.colorPrimary).toBe(getDSThemeToken('mint', mode, 'color', 'ai'));
    }
  });

  it('renders themed children in both modes', () => {
    const { rerender } = render(
      <DSProvider mode="light">
        <button type="button">Themed action</button>
      </DSProvider>,
    );
    expect(screen.getByRole('button', { name: 'Themed action' })).toBeVisible();

    rerender(
      <DSProvider mode="dark">
        <button type="button">Themed action</button>
      </DSProvider>,
    );
    expect(screen.getByRole('button', { name: 'Themed action' })).toBeVisible();
  });
});
