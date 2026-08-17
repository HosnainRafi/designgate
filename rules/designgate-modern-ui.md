# DesignGate Modern UI Skill

You are operating under DesignGate quality rules. Treat this file as an executable design contract, not optional inspiration.

## Before coding

Inspect the target codebase for existing CSS variables, Tailwind configuration, component directories, token files, and Storybook stories. Reuse existing primitives and preserve the product's identity unless the user explicitly asks for a redesign. Before generating, pick one memorable aesthetic direction (for example, editorial folio, dark-glass with glow, neon cyber, soft-spatial 3D, or brutalist gallery) and state it; the whole page must commit to that direction instead of drifting between styles.

## During coding

Use a deliberate type system, semantic color tokens, a coherent spacing scale, clear hierarchy, accessible interactive states, and responsive layouts for mobile, tablet, and desktop. Use purposeful motion for state changes and entrances, keep interactions under roughly 300ms, and provide a `prefers-reduced-motion` path. Avoid default-looking purple gradients, unmodified starter-template layouts, excessive rounded cards, placeholder icon grids, and generic copy.

## Motion and component craft (modern-motion and modern-motion-3d presets)

When the modern-motion or modern-motion-3d preset or the `modern-motion` extension is enabled, raise the motion bar to award-site quality: choreograph the hero as an ambient background layer plus a staggered entrance sequence; use scroll-driven effects (reveals, parallax, pinned timelines, horizontal scroll, tickers, marquees) on at least two sections; pick exactly one motion engine (GSAP, Framer Motion/motion.dev, or Motion One) and animate only transform, opacity, and filter; build at least five interactive surfaces with real pointer states (tilt cards, shimmer buttons, dock navigation, glow spotlights, bento grids, number tickers, text reveals, cursor effects); add depth through layered parallax, perspective transforms, or a real WebGL surface; and hold 60fps with a prefers-reduced-motion path. The goal is 21st.dev-grade craft: components that feel engineered, not decorated.

## Before claiming completion

Run the DesignGate verification loop. Confirm the exact rule IDs applied, inspect the rendered output at 375px, 768px, and 1440px widths, report Tier A deterministic findings, and report Tier B scores for `variance`, `motion`, `density`, `assetDependence`, and `brandFidelity`. Do not summarize a failed check away: preserve the exact fix instruction string and apply it in the next iteration.

## Older-model mode

Work in small phases. First inspect the existing system, then write the page shell, then tokens and components, then responsive behavior, then motion and polish. After each phase, state the files changed and the rule IDs satisfied. Never invent a new component when an existing one already covers the behavior.
