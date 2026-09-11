# @fullstack-ai-infra/ui

The shared visual and interaction system for ByteFolk. It gives Docs, Memory, and future
Digital Employee Web applications one warm, trustworthy workspace without moving business logic into
the component package.

The design language is **Ant Design aligned**: light-first with a switchable dark theme, antd@6
default/dark algorithm values as the color baseline, blue primary, and purple reserved for AI
affordances. Core primitives (Button, Input, Card, Badge, Skeleton) are facades over antd
components behind a stable export surface; the frozen rules are in
[ADR 0002](https://github.com/bytefolk/design-system/blob/main/docs/adr/0002-antd-design-language.md),
which supersedes ADR 0001's retired "Warm Agent Workspace" direction.

> Experimental: the package contract is ready for integration work but no stable npm release is
> promised yet.

## What ships

- Profile-aware light and dark semantic tokens (W3C-format `tokens/design-tokens.json` single
  source, CSS generated via `npm run tokens:generate`) plus reduced-motion behavior.
- A Tailwind preset mapped to the same semantic contract.
- `DSProvider`, the theming provider that wires antd's `ConfigProvider` to the design tokens.
- Button, Input, Card, Badge, Dialog, DropdownMenu, Tooltip, and Skeleton primitives.
- AppShell, ModuleRail, Sidebar, Topbar, PageHeader, AIStatus, and SourceStatus patterns.
- A Vite showcase proving Digital Employees, Memory, and Docs in the same shell.
- Unit, keyboard, accessibility, build, and browser screenshot coverage.

React 18 and React DOM are peer dependencies. Product routing, authentication, i18n, editors,
domain data, and persistence remain in consumer applications.

## Requirements

- Node.js 24 or newer
- npm 11 or newer
- React 18.2 or newer within the React 18 release line

## Develop and verify

```bash
npm ci
npm run dev
```

The showcase opens at <http://localhost:5173>. Run the complete local and CI gate with:

```bash
npx playwright install chromium # first checkout only
npm run check
```

`npm run check` verifies formatting, lint, TypeScript, unit/accessibility tests, package and showcase
builds, an install-and-typecheck of the real npm tarball in a clean consumer, and light/dark browser
screenshots. Reviewed screenshot baselines are versioned; transient actual/diff output stays ignored.

## Install in a consumer

Until the first release, install from a workspace or a pinned Git commit. After publication:

```bash
npm install @fullstack-ai-infra/ui
```

Import the global styles once near the application root:

```ts
import '@fullstack-ai-infra/ui/styles.css';
```

Then compose primitives and patterns:

```tsx
import { Button, Card, CardContent, SourceStatus } from '@fullstack-ai-infra/ui';

export function SourceCard() {
  return (
    <Card>
      <CardContent>
        <SourceStatus state="available" />
        <Button>Open source</Button>
      </CardContent>
    </Card>
  );
}
```

Wrap the application in `DSProvider` once near the root. It configures antd's `ConfigProvider`
with the design-system seed tokens (guarded by tests against `tokens/design-tokens.json`) and
switches between the light and dark algorithm:

```tsx
import { DSProvider } from '@fullstack-ai-infra/ui';

export function App({ children }: { children: React.ReactNode }) {
  return <DSProvider mode="light">{children}</DSProvider>;
}
```

Set the matching theme on the root element so the CSS-variable layer agrees with antd. If no
explicit value exists, the operating-system preference is used.

```html
<html data-theme="light"></html>
```

`default` is the Ant Design-aligned profile. The package also ships `mint`, a compact workbench
profile. Let the application persist the user's profile and mode preference, stamp the profile on
the document root, and pass both values to the provider. This keeps CSS variables and portaled AntD
surfaces synchronized:

```tsx
import { DSProvider, type DSThemeProfile } from '@fullstack-ai-infra/ui';

const profile: DSThemeProfile = 'mint';
document.documentElement.dataset.uiTheme = profile;

<DSProvider profile={profile} mode="dark">
  {children}
</DSProvider>;
```

Theme through `DSProvider` and the design-system tokens only; do not override antd tokens ad hoc
in consumer applications (ADR 0002). A consumer may label a profile for its own product, but its
business data and product-specific composite components remain outside this package.

## Tailwind consumption

Extend the preset; do not copy palette values into the business repository.

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import uiPreset from '@fullstack-ai-infra/ui/tailwind-preset';

export default {
  presets: [uiPreset],
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config;
```

## Next.js App Router / RSC

Import `styles.css` in the root `app/layout.tsx`. The React export is an interactive client surface:
consume it from a small client boundary rather than promoting an entire route to the client.

```tsx
// app/layout.tsx (Server Component)
import '@fullstack-ai-infra/ui/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// components/source-actions.tsx
'use client';

import { Button, DropdownMenu } from '@fullstack-ai-infra/ui';

export function SourceActions() {
  return <Button>Refresh source</Button>;
}
```

Pass serializable data and callbacks owned by the consumer into this boundary. Authentication,
loading, and mutations remain in the Next.js application. The packed-consumer fixture compiles this
exact `'use client'` boundary against the public tarball on every `npm run check`.

## Vite consumption

Vite needs no special plugin beyond its React configuration:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@fullstack-ai-infra/ui';
import '@fullstack-ai-infra/ui/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<Button>Continue</Button>);
```

## Package boundaries

- Use semantic tokens (`var(--ui-primary)`, `text-ai`, `bg-surface`), never copied hex colors.
- Use Lucide icons by default and give icon-only controls an accessible name.
- Use purple only for AI state and AI action meaning.
- Do not add consumer routes, auth, i18n, editor code, or domain data here.
- Do not add React to the `digital-employee` runtime. Only its future Web app consumes this package.

## License

Apache-2.0. See [LICENSE](LICENSE).
