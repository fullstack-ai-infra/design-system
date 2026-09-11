# ADR 0002: Ant Design as the shared design language

- Status: Accepted
- Date: 2026-08-24
- Decision owners: 胡总 (final authority), ByteFolk maintainers
- Tracks: [issue #7](https://github.com/bytefolk/design-system/issues/7)
- Supersedes: [ADR 0001](./0001-warm-agent-workspace.md)

## Context

ADR 0001 established the “Warm Agent Workspace” direction (candidate C): warm ivory canvas, stone
navigation, sage primary, lavender AI accent. It shipped in `tokens/design-tokens.json`,
`src/styles/tokens.css`, the Tailwind preset, and the Radix-based primitives (PR #6).

During org-workbench delivery the visual direction iterated three times (warm ivory → Codex-style
→ Ant Design) before landing a final ruling. The org-workbench high-fidelity prototype rebuilt on
Ant Design (D-L4: nested reporting tree, bubble chat dialog, three-tier budget bar, position
cards) was browser-verified and accepted. Maintaining a bespoke palette and component styling on
top of Radix/Tailwind no longer pays for itself when the accepted direction is Ant Design itself.

## Decision

The shared design language of `@fullstack-ai-infra/ui` becomes **Ant Design**, consumed directly
as the `antd` component library (ruling option b). Specifically:

### Theme contract

- Light is the default mode; dark is available and switchable at the provider level
  (antd `ConfigProvider` `algorithm`: `defaultAlgorithm` / `darkAlgorithm`).
- `default` remains the Ant Design-aligned profile. Additional profiles may be added only to
  support a real consumer requirement, remain product-neutral by name, and provide both light and
  dark values. The initial additional profile is `mint`, a compact high-contrast workbench palette.
- `tokens/design-tokens.json` keeps the W3C Design Tokens format and is the single token source:
  base tokens establish the default profile; a profile may override semantic token values there.
  The same source feeds generated CSS variables (`tokens.css`) and the profile-aware React theme
  (`DSProvider` → AntD `ConfigProvider` `theme.token`).
- Consumers select a profile with `DSProvider profile` and stamp the matching `data-ui-theme` value
  on the document root. They must not duplicate palette values in application CSS or a second AntD
  seed object.
- Erratum (2026-08-25, CEO ruling): the facade aligns to the antd major already running on the
  org-workbench production line — currently antd@6. Dual majors are rejected; a major bump needs a
  new ruling.

### Component contract

- Primitives migrate to antd implementations. The exact API-layer strategy (keeping the existing
  `@fullstack-ai-infra/ui` export surface as a facade over antd versus exporting antd directly)
  is an implementation decision tracked in issue #7 and recorded in the migration PR.
- Semantic roles survive the migration: AI affordances, source/health states, and human-action
  accents remain distinct meanings. Components consume semantic token names, never profile hex
  values.
- Accessibility, keyboard navigation, reduced motion, and dark theme remain required behavior,
  unchanged from ADR 0001.

### Honesty boundary

Status components must keep the honesty contract: an agent without credentials shows idle, never a
fake online state. The base-library switch does not relax this.

## Boundaries

Unchanged from ADR 0001: routing, authentication, i18n, editors, persistence, and domain data stay
in consumer repositories; React and React DOM remain peer dependencies; business repositories do
not recreate primitives.

New: consumers must theme through the design-system provider and tokens, not by overriding antd
tokens ad hoc. User preference persistence and product-facing profile labels remain in consumers.

## Consequences

- Direction C is retired. ADR 0001 is marked Superseded; its historical text remains in the
  repository for traceability.
- Radix dependencies are removed incrementally as primitives migrate; the CHANGELOG records each
  removal.
- Tailwind usage survives temporarily in layout patterns and is re-evaluated in a follow-up.
- Visual regression baselines must be re-cut for both themes after migration; the old C-direction
  snapshots are void.
- The version change ships as 0.2.0 with a BREAKING(visual) note: export surface is intended to
  stay stable, but the rendered language changes entirely.
