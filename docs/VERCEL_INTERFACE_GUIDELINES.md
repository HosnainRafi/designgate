# DesignGate Vercel Web Interface Guidelines

DesignGate now ships Vercel's official **Web Interface Guidelines** as a first-class rule extension, so agent builds can be verified against the same UI discipline Vercel teaches its own agents (published via `vercel-labs/agent-skills` and `vercel-labs/web-interface-guidelines`).

## What is included

| File | Purpose |
| --- | --- |
| `rules/designgate-vercel-interface-guidelines.md` | Human-readable contract distilling the latest upstream Vercel rules: accessibility, focus states, forms, animation, typography craft, content handling, images, performance, navigation and state, touch interaction, layout safety, dark mode, i18n, hydration safety, hover states, copy style, and anti-patterns |
| `rules/extensions/vercel-interface-guidelines.json` | Typed extension manifest with seven deterministic checks (`DG-VERCEL-001` through `DG-VERCEL-007`) plus an opt-in `vercelCraft` Tier B dimension |
| `scripts/fetch-vercel-guidelines.mjs` | CLI script that re-fetches the newest upstream rules for drift comparison |

## Using the extension

Enable the extension at install time or via the project config:

```bash
# Enable through the project config after init.
npx designgate@latest init . --agent claude-code
# Then add to designgate.config.json:
#   "extensions": { "vercel-interface-guidelines": { "enabled": true } }
```

When enabled, `designgate verify` and `designgate check` run the seven additional deterministic checks, and `designgate grade` (with `--grade`) scores the new `vercelCraft` dimension alongside the standard Tier B dimensions.

## Freshness

Vercel updates its guidelines continuously, so the contract includes a drift-check step: run `node scripts/fetch-vercel-guidelines.mjs` (or `npm run designgate:vercel-fetch-rules`) to pull the newest upstream rules, compare them against `rules/designgate-vercel-interface-guidelines.md`, and report any drift in the build report. The extension manifest records the upstream source URL (`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`) so the fetch script always points at the canonical location.

## Verification loop

The verification loop treats the Vercel rules as executable evidence, matching the pattern of every other DesignGate rule:

| Rule ID | Deterministic evidence |
| --- | --- |
| DG-VERCEL-001 | `aria-label`, `<label>`, `aria-hidden`, `<button>`/`<a>` usage |
| DG-VERCEL-002 | `focus-visible:ring`, `focus-visible` presence, absence of bare `outline:none` |
| DG-VERCEL-003 | `prefers-reduced-motion`, explicit property lists, absence of `transition: all` |
| DG-VERCEL-004 | explicit `width`/`height` on `<img>`, `loading="lazy"`, `fetchpriority` |
| DG-VERCEL-005 | virtualization (`virtua`, `content-visibility`), `preload` fonts, overflow handling |
| DG-VERCEL-006 | `touch-action: manipulation`, `overscroll-behavior: contain` |
| DG-VERCEL-007 | `Intl.DateTimeFormat`/`Intl.NumberFormat` usage, non-empty `content-visibility` |
