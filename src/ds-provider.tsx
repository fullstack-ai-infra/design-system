/* eslint-disable react-refresh/only-export-components */
import { ConfigProvider, theme, type ConfigProviderProps } from 'antd';
import { createContext, useContext, type ReactNode } from 'react';

import { getDSAiTokens, getDSSeedTokens, type DSMode, type DSThemeProfile } from './theme-profiles';

export type { DSMode, DSThemeProfile } from './theme-profiles';
export {
  dsThemeProfiles,
  getDSAiTokens,
  getDSSeedTokens,
  getDSThemeToken,
  isDSThemeProfile,
} from './theme-profiles';

/** Backwards-compatible default-profile views. New consumers should call the
 * profile-aware getters above. */
export const dsSeedTokens: Record<DSMode, Record<string, string | number>> = {
  light: getDSSeedTokens('default', 'light'),
  dark: getDSSeedTokens('default', 'dark'),
};

export const dsAiTokens: Record<DSMode, Record<string, string>> = {
  light: getDSAiTokens('default', 'light'),
  dark: getDSAiTokens('default', 'dark'),
};

type DSThemeContextValue = { mode: DSMode; profile: DSThemeProfile };

const DSThemeContext = createContext<DSThemeContextValue>({ mode: 'light', profile: 'default' });

export function useDSMode(): DSMode {
  return useContext(DSThemeContext).mode;
}

export function useDSThemeProfile(): DSThemeProfile {
  return useContext(DSThemeContext).profile;
}

export interface DSProviderProps {
  /** Antd algorithm switch. CSS variables follow `data-theme` separately. */
  mode?: DSMode;
  /** A profile from tokens/design-tokens.json. The consumer controls the
   * matching `data-ui-theme` attribute for CSS and persistence. */
  profile?: DSThemeProfile;
  locale?: ConfigProviderProps['locale'];
  button?: ConfigProviderProps['button'];
  children: ReactNode;
}

export function DSProvider({
  mode = 'light',
  profile = 'default',
  locale,
  button,
  children,
}: DSProviderProps) {
  return (
    <DSThemeContext.Provider value={{ mode, profile }}>
      <ConfigProvider
        locale={locale}
        button={button}
        theme={{
          hashed: true,
          algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: getDSSeedTokens(profile, mode),
        }}
      >
        {children}
      </ConfigProvider>
    </DSThemeContext.Provider>
  );
}
