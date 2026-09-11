import tokenSource from '../tokens/design-tokens.json';

export type DSMode = 'light' | 'dark';

type TokenValue = string | Partial<Record<DSMode, string>>;
type TokenEntry = { $value: TokenValue };
type TokenGroups = Record<string, Record<string, TokenEntry>>;
type ProfileSource = { tokens?: TokenGroups };

const source = tokenSource as unknown as {
  tokens: TokenGroups;
  profiles?: Record<string, ProfileSource>;
};

export const dsThemeProfiles = ['default', ...Object.keys(source.profiles ?? {})] as const;
export type DSThemeProfile = (typeof dsThemeProfiles)[number];

export function isDSThemeProfile(value: unknown): value is DSThemeProfile {
  return typeof value === 'string' && (dsThemeProfiles as readonly string[]).includes(value);
}

function profileSource(profile: DSThemeProfile): ProfileSource | undefined {
  return profile === 'default' ? undefined : source.profiles?.[profile];
}

function valueFor(value: TokenValue, mode: DSMode): string {
  return typeof value === 'string' ? value : (value[mode] ?? value.light ?? value.dark ?? '');
}

/** Reads a semantic value from the default token set, optionally overridden by
 * a named, validated profile in tokens/design-tokens.json. */
export function getDSThemeToken(
  profile: DSThemeProfile,
  mode: DSMode,
  group: string,
  name: string,
): string {
  const base = source.tokens[group]?.[name];
  const override = profileSource(profile)?.tokens?.[group]?.[name];
  const token = override ?? base;
  if (!token) throw new Error(`Unknown design token: ${group}.${name}`);
  return valueFor(token.$value, mode);
}

function asNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed))
    throw new Error(`Expected a numeric design token, received ${value}`);
  return parsed;
}

/** Ant Design seed values are derived from the same semantic token source as
 * CSS. Keep this mapping here instead of duplicating palettes in consumers. */
export function getDSSeedTokens(
  profile: DSThemeProfile,
  mode: DSMode,
): Record<string, string | number> {
  const color = (name: string) => getDSThemeToken(profile, mode, 'color', name);
  return {
    colorPrimary: color('primary'),
    colorPrimaryHover: color('primary-hover'),
    colorPrimaryActive: color('primary-hover'),
    colorPrimaryBg: color('primary-soft'),
    colorPrimaryBgHover: color('primary-soft'),
    colorPrimaryBorder: color('border'),
    colorPrimaryBorderHover: color('border-strong'),
    colorInfo: color('info'),
    colorInfoBg: color('info-soft'),
    colorLink: color('primary'),
    colorLinkHover: color('primary-hover'),
    colorLinkActive: color('primary-hover'),
    colorSuccess: color('success'),
    colorSuccessHover: color('success-strong'),
    colorSuccessActive: color('success-strong'),
    colorSuccessBg: color('success-soft'),
    colorWarning: color('warning'),
    colorWarningHover: color('warning-strong'),
    colorWarningActive: color('warning-strong'),
    colorWarningBg: color('warning-soft'),
    colorError: color('danger'),
    colorErrorHover: color('danger-strong'),
    colorErrorActive: color('danger-strong'),
    colorErrorBg: color('danger-soft'),
    colorBorder: color('border'),
    colorBorderSecondary: color('border'),
    colorBgBase: color('surface'),
    colorBgContainer: color('surface'),
    colorBgElevated: color('surface-raised'),
    colorBgLayout: color('canvas'),
    colorFillAlter: color('surface-inset'),
    controlItemBgHover: color('navigation-hover'),
    controlItemBgActive: color('selection'),
    controlItemBgActiveHover: color('selection'),
    colorText: color('foreground'),
    colorTextSecondary: color('foreground-muted'),
    colorTextTertiary: color('foreground-subtle'),
    colorTextPlaceholder: color('foreground-subtle'),
    colorTextDisabled: color('foreground-subtle'),
    colorBgContainerDisabled: color('surface-inset'),
    colorTextLightSolid: color('primary-foreground'),
    borderRadius: asNumber(getDSThemeToken(profile, mode, 'borderRadius', 'radius-md')),
    borderRadiusSM: asNumber(getDSThemeToken(profile, mode, 'borderRadius', 'radius-sm')),
    borderRadiusLG: asNumber(getDSThemeToken(profile, mode, 'borderRadius', 'radius-lg')),
    borderRadiusOuter: asNumber(getDSThemeToken(profile, mode, 'borderRadius', 'radius-xl')),
    fontSize:
      profile === 'default'
        ? 14
        : asNumber(getDSThemeToken(profile, mode, 'fontSize', 'text-base')),
    fontFamily: getDSThemeToken(profile, mode, 'fontFamily', 'font-sans'),
    motionDurationFast: getDSThemeToken(profile, mode, 'duration', 'duration-fast'),
    motionDurationMid: getDSThemeToken(profile, mode, 'duration', 'duration-normal'),
    motionEaseInOut: getDSThemeToken(profile, mode, 'timingFunction', 'ease'),
    motionEaseOut: getDSThemeToken(profile, mode, 'timingFunction', 'ease'),
  };
}

export function getDSAiTokens(profile: DSThemeProfile, mode: DSMode): Record<string, string> {
  return {
    colorPrimary: getDSThemeToken(profile, mode, 'color', 'ai'),
    colorPrimaryHover: getDSThemeToken(profile, mode, 'color', 'ai-hover'),
    colorPrimaryActive: getDSThemeToken(profile, mode, 'color', 'ai-strong'),
  };
}
