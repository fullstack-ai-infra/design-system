// Generate src/styles/tokens.css from the single source tokens/design-tokens.json (ADR 0002).
// Usage: node scripts/generate-tokens-css.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const root = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const json = JSON.parse(readFileSync(path.join(root, 'tokens', 'design-tokens.json'), 'utf8'));

// CSS custom property order: colors first (group order in JSON), then the rest.
const groups = json.tokens;
const entries = [];
for (const [group, tokens] of Object.entries(groups)) {
  for (const [name, token] of Object.entries(tokens)) {
    entries.push({ group, name, token });
  }
}

const profiles = json.profiles ?? {};

function valueFor(value, mode) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value[mode] ?? value.light;
  }
  return value;
}

function tokenFor(profile, group, name, token) {
  return profile?.tokens?.[group]?.[name] ?? token;
}

function renderBlock(mode, indent, profile) {
  const lines = [];
  if (mode === 'light') lines.push(`${indent}color-scheme: light;`);
  if (mode === 'dark') lines.push(`${indent}color-scheme: dark;`);
  lines.push('');
  for (const { group, name, token } of entries) {
    const profileToken = tokenFor(profile, group, name, token);
    lines.push(`${indent}--ui-${name}: ${valueFor(profileToken.$value, mode)};`);
  }
  return lines.join('\n');
}

const lightBlock = `:root,
[data-theme='light'] {
${renderBlock('light', '  ')}
}
`;

const darkBlock = `[data-theme='dark'] {
${renderBlock('dark', '  ')}
}
`;

const systemDarkBlock = `@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
${renderBlock('dark', '    ')}
  }
}
`;

function renderProfile(profileName, profile) {
  const light = `:root[data-ui-theme='${profileName}']:not([data-theme]),
[data-ui-theme='${profileName}'][data-theme='light'] {
${renderBlock('light', '  ', profile)}
}
`;
  const dark = `[data-ui-theme='${profileName}'][data-theme='dark'] {
${renderBlock('dark', '  ', profile)}
}
`;
  const systemDark = `@media (prefers-color-scheme: dark) {
  :root[data-ui-theme='${profileName}']:not([data-theme]) {
${renderBlock('dark', '    ', profile)}
  }
}
`;
  return `${light}\n${dark}\n${systemDark}`;
}

const reducedMotionBlock = `@media (prefers-reduced-motion: reduce) {
  :root {
    --ui-duration-fast: 0ms;
    --ui-duration-normal: 0ms;
  }

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

const header = `/* Generated from tokens/design-tokens.json by scripts/generate-tokens-css.mjs. */
/* Do not edit by hand; edit the JSON source and rerun npm run tokens:generate. */

`;

const profileBlocks = Object.entries(profiles)
  .map(([profileName, profile]) => renderProfile(profileName, profile))
  .join('\n');

const css = `${header}${lightBlock}
${darkBlock}
${systemDarkBlock}
${profileBlocks}
${reducedMotionBlock}`;

const outPath = path.join(root, 'src', 'styles', 'tokens.css');
const prettier = await import('prettier');
const prettierConfig = await prettier.resolveConfig(outPath);
const formatted = await prettier.format(css, { ...prettierConfig, filepath: outPath });
writeFileSync(outPath, formatted);
console.log(`Wrote ${path.relative(root, outPath)}: ${entries.length} tokens (light+dark).`);
