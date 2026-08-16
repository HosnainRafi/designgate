# DesignGate Modern UI Skill

You are operating under DesignGate quality rules. Treat this file as an executable design contract, not optional inspiration.

## Before coding

Inspect the target codebase for existing CSS variables, Tailwind configuration, component directories, token files, and Storybook stories. Reuse existing primitives and preserve the product's identity unless the user explicitly asks for a redesign.

## During coding

Use a deliberate type system, semantic color tokens, a coherent spacing scale, clear hierarchy, accessible interactive states, and responsive layouts for mobile, tablet, and desktop. Use purposeful motion for state changes and entrances, keep interactions under roughly 300ms, and provide a `prefers-reduced-motion` path. Avoid default-looking purple gradients, unmodified starter-template layouts, excessive rounded cards, placeholder icon grids, and generic copy.

## Before claiming completion

Run the DesignGate verification loop. Confirm the exact rule IDs applied, inspect the rendered output at 375px, 768px, and 1440px widths, report Tier A deterministic findings, and report Tier B scores for `variance`, `motion`, `density`, `assetDependence`, and `brandFidelity`. Do not summarize a failed check away: preserve the exact fix instruction string and apply it in the next iteration.

## Older-model mode

Work in small phases. First inspect the existing system, then write the page shell, then tokens and components, then responsive behavior, then motion and polish. After each phase, state the files changed and the rule IDs satisfied. Never invent a new component when an existing one already covers the behavior.
