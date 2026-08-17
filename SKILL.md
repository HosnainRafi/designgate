---
name: designgate
description: "Install and operate DesignGate’s agent-agnostic UI quality gate for a web project; detect existing design primitives, capture responsive evidence, run Tier A checks and opt-in Tier B vision grading, and relay exact feedback without paraphrase."
metadata:
  openclaw:
    user-invocable: true
---

# DesignGate UI Quality Gate

Use this skill when a user asks to create, redesign, inspect, verify, or improve a website, frontend, dashboard, component library, or another visual software interface.

## Required operating sequence

1. Work from the target project root. Before modifying the project, inspect whether `designgate.config.json`, `.designgate/manifest.json`, and `.designgate/project-context.json` already exist.
2. If DesignGate is not installed, install it with the matching agent and framework preset:

   ```bash
   npx designgate@latest init . --agent generic --preset base
   ```

   Use `react`, `nextjs`, `vue`, `component-library`, `modern-motion`, `modern-motion-3d`, or `premium-3d` when it matches the project. If the DesignGate npm package is not published or is unavailable, use the checked-out source CLI instead:

   ```bash
   node /path/to/designgate/cli/designgate.mjs init . --agent generic --preset base
   ```

3. Read `designgate.config.json`, `.designgate/project-context.json`, and the native instruction file written for the coding agent. The instruction file embeds four prescriptive contracts — world-class typography (exact font systems), world-class color & material (approved palettes), world-class imagery & art-direction, and the motion bible — which the design MUST follow in full. Reuse detected tokens and components while building or modifying the interface.
4. Start the project’s preview server using its documented command. Capture all three required breakpoints from a reachable target URL:

   ```bash
   npx designgate@latest render http://localhost:3000 --project .
   ```

5. Verify quality evidence. Use `--grade` only when the user has supplied `ANTHROPIC_API_KEY` in the execution environment and has authorized the Claude-compatible provider call:

   ```bash
   npx designgate@latest check http://localhost:3000 --project .
   npx designgate@latest check http://localhost:3000 --project . --grade
   ```

6. Read `.designgate/report.json`. When Tier A or Tier B fails, send the generator the failed `detail` strings and Tier B critique exactly as written. Do not condense, reword, translate, or merge them.
7. Repeat only up to the project’s explicit iteration cap. Escalate unresolved visual judgment, accessibility questions, and release decisions to the user or a human reviewer.

## Constraints

- Treat captured screenshots as evidence, not proof that the design is production-ready.
- Do not claim a check passed until `.designgate/report.json` shows `"passed": true`.
- Preserve the mobile (`390 × 844`), tablet (`834 × 1112`), and desktop (`1440 × 1000`) capture evidence.
- Do not store PNG bytes in a database. When importing dashboard evidence, use S3-backed iteration evidence through the documented import flow.
- Never run an untrusted generator command in a loop without the user’s approval.
- Do not place `ANTHROPIC_API_KEY` in prompts, source files, or reports. A requested `--grade` without that key must fail safely rather than silently skipping Tier B.

For detailed commands, dashboard evidence import, supported adapters, and safeguards, read [`docs/GUIDE.md`](docs/GUIDE.md). For the desktop-agent workflow, read [`docs/AUTOCLAW_DESKTOP.md`](docs/AUTOCLAW_DESKTOP.md).


## Immersive 3D, Modern Motion, and Goal Mode

For a browser-rendered 3D project, initialize the additive preset before generation:

```bash
npx designgate@latest init . --agent generic --preset gaming-3d
npx designgate@latest plan "Build a multiplayer 3D game with a cinematic lobby" --project .
npx designgate@latest build "Build a multiplayer 3D game with a cinematic lobby" --generator "npm run agent:generate" --project . --target http://localhost:3000 --grade
```

For a premium modern site with award-site motion choreography, animated heroes, scroll-driven reveals, glow depth, and 21st.dev-grade component craft (PixelCraft-, Lumina-, Voyage-style effects), initialize the additive preset before generation:

```bash
npx designgate@latest init . --agent generic --preset modern-motion
```

Use `modern-motion` for motion without real-time 3D and `modern-motion-3d` when a WebGL/Three.js surface is also wanted. Both presets register the additive `modern-motion` extension, which adds five Tier A checks (motion library evidence, choreography evidence, reduced-motion fallback, animated pointer states, scroll-safe choreography) and a sixth Tier B dimension, `motionCraft` (worth 20% of the vision grade), scored for sequenced entrances, scroll-driven effects, easing personality, 60fps feel, and the absence of jank or over-animation.

For the highest-end, awwwards-grade build — cinematic animated heroes, scroll storytelling, grain and noise textures, smooth scrolling (Lenis / GSAP ScrollSmoother / Locomotive), and components from curated premium registries (Aceternity UI, Magic UI, ReactBits, 21st.dev, shadcn/ui) — use the `premium-3d` preset. It registers both the `modern-motion` and `premium-stack` extensions and adds the Tier B `premiumCraft` dimension (10%, with `motionCraft` at 10%) scored for component polish, surface depth, texture and material quality, and finish:

```bash
npx designgate@latest init . --agent generic --preset premium-3d
```

Goal Mode supports `gaming`, `portfolio`, and `ecommerce`. Unknown categories must fail explicitly. The generated goal brief and Phase-0 project context must be passed to the generator before its first attempt. When `immersive3d` is active, preserve the canvas/WebGL, supported-dependency, depth, interaction, performance, and conditional `immersiveness` evidence in the report. When the `modern-motion` extension is active, preserve the motion library, choreography, reduced-motion, pointer-state, and scroll-safe evidence in the report. When the `premium-stack` extension is active, preserve the premium-library, WebGL/3D, smooth-scroll, texture/grain, and RAF-based handling evidence in the report. Legacy projects without a preset continue to use the standard rules and five Tier B dimensions.
