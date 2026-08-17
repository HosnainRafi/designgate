# DesignGate Product Guide

DesignGate is an **installable, agent-agnostic UI design quality gate**. It does not ask an agent to merely claim that a screen is polished. Instead, it installs a portable rule contract, captures browser evidence, verifies deterministic signals, records a reviewable report, and can return the failed rule instructions to a generator in a bounded fix-and-retry loop.

> DesignGate is a quality-control layer, not a substitute for product judgment, usability research, accessibility testing, security review, or human approval.

## Contents

| Topic | Purpose |
| --- | --- |
| [Quick start](#quick-start) | Install the contract and run an initial check. |
| [System architecture](#system-architecture) | Understand the CLI, evidence, dashboard, and persistence boundaries. |
| [Rule contract and Tier A](#rule-contract-and-tier-a-deterministic-verification) | Inspect deterministic rule verification. |
| [Tier B grading](#tier-b-vision-grading) | Understand the visual-rubric layer in the hosted dashboard. |
| [Evidence and persistence](#evidence-and-persistence) | Capture mobile, tablet, and desktop proof and import it safely. |
| [Agent integration](#agent-integration-and-presets) | Use native instruction files, framework presets, and an older-model workflow. |
| [Reports and loop](#reports-and-the-bounded-grading-loop) | Consume structured reports and send exact feedback back to a generator. |
| [Safeguards](#safeguards-and-non-goals) | Apply the system responsibly. |

## Quick start

Run the initializer from the root of the project that an agent will build or change. The default adapter is `generic`; choose a native adapter when the project uses a supported coding agent.

```bash
npx designgate@latest init . --agent claude-code --preset react
npx designgate@latest rules .
npx designgate@latest verify .
```

The first command writes the following auditable artifacts.

| Path | Function |
| --- | --- |
| `designgate.config.json` | Project-local thresholds, iteration cap, preset, and Tier A/Tier B options. |
| `.designgate/manifest.json` | Installed rule set, rule payload hashes, selected preset, and installation metadata. |
| `.designgate/agents/*.md` | Compiled instruction text for every supported adapter. |
| Native instruction files | Agent-native copies of the DesignGate contract. |
| `.github/workflows/designgate.yml` | A pull-request `verify-ui` quality-gate workflow. |

Install Chromium before commands that render a page.

```bash
npx playwright install chromium
npx designgate@latest render http://localhost:3000 --project .
npx designgate@latest check http://localhost:3000 --project .
```

`check` is a convenience command that renders the supplied target, then creates `.designgate/report.json`. Use a running URL for an application route; a local directory is accepted only when it contains `index.html`.

## System architecture

DesignGate has two cooperating layers. The portable package provides a complete local quality loop: it produces source-level verification, browser evidence, inline Tier B vision grading, and exact feedback for a caller-provided generator. The hosted dashboard is an optional, richer persistence and comparison layer rather than a prerequisite for visual grading.

| Layer | Primary responsibility | Durable output |
| --- | --- | --- |
| **Rule package** | Installs agent instructions, detects existing project context, captures screenshots, performs deterministic verification, grades with an explicitly enabled vision API, and emits exact feedback. | `designgate.config.json`, `.designgate/manifest.json`, `.designgate/project-context.json`, captures, `report.json`. |
| **Renderer** | Uses Playwright Chromium to visit a target with fixed viewports and reduced-motion emulation. | Three full-page PNG files and a capture manifest. |
| **Tier A verifier** | Inspects project artifacts, the installed manifest, and capture presence. | Per-rule pass/fail evidence, changed-file classification, and a numeric compliance score. |
| **Inline Tier B grader** | When `--grade` is explicitly requested, sends three local captures to a Claude-compatible vision endpoint using the caller’s `ANTHROPIC_API_KEY`. | Dimension scores, notes, weighted score, and exact generator-facing instructions in `report.json`. |
| **Hosted dashboard** | Optionally creates runs, stores run configuration and rubric configuration in the database, records iterations, and presents reports. | MySQL/TiDB run, iteration, and rubric records. |
| **Evidence storage** | Stores imported screenshot bytes outside the database. | S3 objects at `runs/<runId>/iteration-<iteration>/…` and URLs/metadata on the iteration. |
| **Hosted Tier B grader** | Grades imported screenshot evidence against the configured visual rubric and returns critiques. | Dimension scores, notes, and exact generator-facing instructions. |

The source package intentionally keeps the generator separate. It does not require a particular LLM provider, model family, IDE, or framework. The caller supplies the generator command only when using the bounded loop.

## Rule contract and Tier A deterministic verification

Every base rule has a stable ID, category, `required` flag, machine-readable payload, and a SHA-256 payload hash. The verifier recomputes each payload hash, confirms that the installed agent output contains the same rule IDs and source hash, then tests for concrete evidence in project files and DesignGate artifacts.

| Rule ID | Verification focus | Typical evidence expected by Tier A |
| --- | --- | --- |
| `DG-TYPO-001` | Typography | A font declaration, import, or display configuration. |
| `DG-COLOR-001` | Semantic color treatment | Semantic color tokens and no obvious generic purple-to-pink treatment. |
| `DG-LAYOUT-001` | Layout hierarchy and spacing | Grid/flex layout plus spacing evidence. |
| `DG-MOTION-001` | Purposeful motion | Motion/transition evidence plus a reduced-motion fallback. |
| `DG-RESP-001` | Responsive behavior | Responsive rules without forced horizontal scrolling. |
| `DG-A11Y-001` | Accessibility affordances | Accessible labels, alternative text, focus styling, or semantic controls. |
| `DG-ASSET-001` | Asset discipline | No obvious placeholder, stock-image, or lorem-ipsum dependency. |
| `DG-COMP-001` | Component reuse | A component directory or component-import evidence. |
| `DG-VERIFY-001` | Completion verification | Installed manifest plus capture or verification evidence. |

Tier A is deliberately deterministic and conservative. It checks **evidence of a quality practice**, not whether an interface is aesthetically excellent. A passing source check therefore does not replace a visual review.

### What `verify` evaluates

```bash
npx designgate@latest verify .
```

The command recursively reads text-bearing project artifacts while excluding `node_modules`, `.git`, `.designgate`, `dist`, and `build`. It evaluates the base rules, attempts to identify changed files from Git, validates installed manifest hashes, writes `.designgate/report.json`, and exits with code `0` only when every required rule passed. A non-zero exit code is expected when a quality gate fails and is appropriate for CI.

## Tier B vision grading

Tier B is available directly from the public CLI and through the optional hosted dashboard. The standalone path considers screenshots rather than treating CSS text as proof of visual quality; it does **not** require a database, S3 bucket, or dashboard run. The hosted dashboard remains useful when teams need persisted run history, rubric administration, S3 evidence import, and side-by-side iteration comparison.

The current grading contract surfaces these exact dimension names:

| Dimension name | What the dimension is intended to assess |
| --- | --- |
| `variance` | Whether the composition, hierarchy, and visual choices show intentional differentiation rather than generic repetition. |
| `motion` | Whether motion is purposeful, restrained, and compatible with a reduced-motion experience. |
| `density` | Whether information density, spacing, and hierarchy remain legible at the captured sizes. |
| `assetDependence` | Whether the result depends on placeholder, generic stock, or unverified external visual assets. |
| `brandFidelity` | Whether the visual system follows the run’s specified brand and design-direction expectations. |

> Tier B should be read as a structured review signal. It is not an objective proof of accessibility, legal compliance, trademark clearance, or fitness for a high-stakes domain.

The dashboard score view, critique viewer, and iteration history preserve the relationship between a capture, its rubric, its Tier A checks, and its Tier B outcome. The standalone CLI writes the equivalent Tier B object to `.designgate/report.json`. **Fix instructions shown by the critique viewer or emitted in the CLI report must be forwarded to the generator verbatim.** Do not summarize or paraphrase them; the text is the review contract for the next iteration.

### Standalone provider-agnostic grading

Set a provider key in the shell that runs the CLI, then request grading explicitly. DesignGate submits only the three rendered PNG captures and the fixed grading prompt to the configured vision endpoint. Anthropic is the backward-compatible default. A plain string such as `"claude-sonnet-4-6"` continues to resolve to Anthropic; an object selects the provider, base URL, model, and environment-variable name without storing the secret in project configuration.

| Provider | Config example | Required environment variable | Request shape |
| --- | --- | --- | --- |
| Anthropic | `{ "provider": "anthropic", "model": "claude-sonnet-4-6", "apiKeyEnvVar": "ANTHROPIC_API_KEY", "baseUrl": "https://api.anthropic.com", "supportsVision": true }` | `ANTHROPIC_API_KEY` | Anthropic Messages API |
| Mistral Pixtral | `{ "provider": "openai-compatible", "baseUrl": "https://api.mistral.ai/v1", "model": "pixtral-large-latest", "apiKeyEnvVar": "MISTRAL_API_KEY", "supportsVision": true }` | `MISTRAL_API_KEY` | OpenAI-compatible `/chat/completions` |
| OpenRouter | `{ "provider": "openai-compatible", "baseUrl": "https://openrouter.ai/api/v1", "model": "google/gemini-2.0-flash-001", "apiKeyEnvVar": "OPENROUTER_API_KEY", "supportsVision": true }` | `OPENROUTER_API_KEY` | OpenAI-compatible `/chat/completions` |

For a custom endpoint, use the same `openai-compatible` provider and change only `baseUrl`, `model`, and `apiKeyEnvVar`. The provider validates `supportsVision` before sending any screenshot. If it is `false`, grading stops with an error naming the configured model and asking for a vision-capable model; it never silently falls back to text-only grading.

```json
{
  "tierB": {
    "gradingModel": {
      "provider": "openai-compatible",
      "baseUrl": "https://api.mistral.ai/v1",
      "model": "pixtral-large-latest",
      "apiKeyEnvVar": "MISTRAL_API_KEY",
      "supportsVision": true
    }
  }
}
```

```bash
export MISTRAL_API_KEY="your-key"
npx designgate@latest check http://localhost:3000 --project . --grade
npx designgate@latest grade .
```

If the configured environment variable is absent, `--grade` and `grade` stop before making a network request and print an actionable setup message. They do not silently downgrade a requested visual-quality gate into Tier A-only verification. Because providers can be stricter or more lenient than the Claude baseline, run the same representative screenshot set through at least two providers and sanity-check that weighted scores are in the same ballpark before changing project thresholds. DesignGate’s provider contract test uses one fixed golden set and asserts that Anthropic and an OpenAI-compatible adapter return the same five-dimension score shape and valid 1–5 scores; use that test as the minimum provider rollout gate.

```bash
pnpm vitest run server/providers.test.ts
```

For a new provider, replay the same captured breakpoint set through the new adapter and the Anthropic baseline, compare the normalized dimensions and weighted overall score, and document any expected variance before enabling it for production thresholds.

## Evidence and persistence

### Multi-breakpoint capture

The renderer always produces full-page PNGs for the following breakpoints.

| Breakpoint | Viewport |
| --- | --- |
| `mobile` | `390 × 844` |
| `tablet` | `834 × 1112` |
| `desktop` | `1440 × 1000` |

```bash
npx designgate@latest render http://localhost:3000 --project .
```

The command saves a timestamped directory below `.designgate/captures/` and updates `.designgate/latest-capture.json`. It emulates `prefers-reduced-motion: reduce` while rendering, so essential visual states should remain understandable without decorative animation.

### Evidence import for the hosted dashboard

After a dashboard run and matching iteration have been created, generate an import payload.

```bash
npx designgate@latest evidence . --run-id 42 --iteration 1
```

The generated `.designgate/evidence-import.json` contains the capture manifest plus Base64-encoded PNG files. Submit it through the hosted application’s `runs.importEvidence` procedure. The server writes the image bytes to S3 at `runs/<runId>/iteration-<iteration>/`, replaces the iteration screenshot map with stored URL and capture metadata, and exposes those records through the report API.

| Data type | Persistence location | Reason |
| --- | --- | --- |
| Run configuration | Database | Queryable, auditable run-level settings. |
| Rubric configuration | Database | Versionable grading expectations associated with a run. |
| Iteration metadata, Tier A/Tier B results, critique | Database | Comparable history and dashboard reporting. |
| Full PNG evidence | S3 | Keeps binary files out of transactional database rows. |

Do not store screenshot bytes in database BLOB columns. Persist object metadata and URLs with the iteration instead.

## Agent integration and presets

The initializer compiles the same verified base contract for six adapters. It writes all of the native files so a project can switch agents without losing auditability.

| Adapter argument | Native project file |
| --- | --- |
| `claude-code` | `CLAUDE.md` |
| `cursor` | `.cursor/rules/designgate.mdc` |
| `codex-cli` | `AGENTS.md` |
| `gemini-cli` | `GEMINI.md` |
| `copilot` | `.github/copilot-instructions.md` |
| `generic` | `DESIGNGATE.md` |

Select a framework preset at installation time. A preset is recorded in the installed manifest and inserted into the compiled instruction output; it supplements, rather than replaces, the portable base rule set.

```bash
npx designgate@latest init . --agent cursor --preset react
npx designgate@latest init . --agent generic --preset nextjs
npx designgate@latest init . --agent generic --preset vue
npx designgate@latest init . --agent generic --preset component-library
npx designgate@latest init . --agent generic --preset modern-motion
npx designgate@latest init . --agent generic --preset modern-motion-3d
npx designgate@latest rules .
```

### Phase-0 project context detection

`init` and `context` write `.designgate/project-context.json`. The inventory records discovered CSS custom-property tokens and reusable components under project component directories. A graded loop forwards that inventory to the generator **before its first generation attempt**, instructing it to reuse the project’s existing tokens and primitives rather than inventing a visually conflicting replacement.

```bash
npx designgate@latest context .
npx designgate@latest loop . \
  --generator "npm run agent:fix" \
  --grade --target http://localhost:3000
```

Context detection is an inventory, not an architectural migration tool. Review its output when a repository uses unconventional file locations or generated design-token files.

### Compatibility workflow for older models

Older or lower-capability coding models benefit from a smaller, ordered task. Use the generated native instruction file and require the model to complete one iteration at a time.

1. Ask the model to read its native DesignGate instruction file and `designgate.config.json` before editing.
2. Ask it to make one focused implementation pass: establish tokens and typography, implement responsive layout, add only purposeful motion, and preserve a reduced-motion fallback.
3. Run `verify` or `check` yourself, or give the model the captured failure output.
4. Provide **only the exact failed `detail` strings** from `.designgate/report.json` or the dashboard critique viewer.
5. Ask the model to identify the files it changed and rerun the check.
6. Stop at the configured iteration cap and escalate unresolved visual judgment to a human reviewer.

This approach avoids asking a weaker model to interpret a broad statement such as “make it look modern.” It narrows the next action to an auditable, rule-specific correction.

## Reports and the bounded grading loop

### Report shape

`verify` writes a Tier A-only `schemaVersion: "1.2.0"` report. `check --grade`, `grade`, and `loop --grade` write a combined `schemaVersion: "1.3.0"` report with Tier A, Tier B, the Phase-0 project context, capture metadata, and exact feedback.

```json
{
  "schemaVersion": "1.3.0",
  "target": "/workspace/product",
  "score": 78,
  "passed": false,
  "ruleSet": "designgate-modern-ui",
  "manifestVersion": "1.1.0",
  "capture": { "engine": "playwright-chromium", "captures": [] },
  "tierA": { "score": 78, "passed": false, "checks": [
    {
      "id": "DG-MOTION-001",
      "required": true,
      "applied": false,
      "evidence": "motion plus reduced-motion fallback",
      "payloadHashValid": true,
      "agentOutputMatching": true,
      "detail": "Missing concrete evidence for DG-MOTION-001; exact instruction: …"
    }
  ] },
  "tierB": {
    "provider": "anthropic",
    "model": "claude-sonnet-4-6",
    "evaluatedBreakpoints": ["mobile", "tablet", "desktop"],
    "overallScore": 3.2,
    "passed": false,
    "dimensions": { "variance": { "score": 2, "note": "…" } },
    "critique": "Improve variance: …"
  }
}
```

The literal `detail` property is the exact feedback string. Consumers should preserve it byte-for-byte when relaying it to a generator.

### Bounded loop pseudocode

The Tier A-only loop is intentionally simple and bounded. Add `--grade --target <url-or-local-html>` to activate the complete standalone visual-quality loop.

```text
context = detect existing tokens and reusable components
send context to the generator before its first generation attempt

for iteration in 1..maxIterations:
    capture mobile, tablet, desktop screenshots
    tierA = verify(project)
    tierB = grade screenshots with Claude-compatible vision API
    report = combine(tierA, tierB, context)
    persist report.json
    if every required Tier A check and Tier B threshold passes:
        stop successfully

    exactFeedback = join(failed Tier A check.detail, failed Tier B critique)
    run the caller-provided generator command with:
        Phase-0 context + "DesignGate exact feedback:" + exactFeedback

exit non-zero after the limit
```

Run it only with a generator command that you trust and understand.

```bash
npx designgate@latest loop . \
  --generator "npm run agent:fix" \
  --grade --target http://localhost:3000 \
  --max-iterations 5
```

The configuration file provides the persistent defaults and expected policy surface:

```json
{
  "threshold": { "overall": 3.5, "perDimensionFloor": 2 },
  "maxIterations": 5,
  "preset": "react",
  "tierA": {},
  "tierB": {
    "provider": "anthropic",
    "gradingModel": "auto",
    "useProjectContext": true
  }
}
```

`gradingModel: "auto"` is not an opaque hosted setting. In the standalone CLI it resolves to `DESIGNGATE_ANTHROPIC_MODEL` when that environment variable is set; otherwise it resolves to `claude-sonnet-4-6`. Pass `--model <model-id>` to override either value for one command. `tierB.provider` currently accepts `"anthropic"` only. `--grade` requires `ANTHROPIC_API_KEY`; no key means no API request and a non-zero exit.

The CLI loop accepts `--max-iterations`; treat `designgate.config.json` as the project’s auditable policy record and keep its value aligned with the invocation used in CI or automation.

## Safeguards and non-goals

| Safeguard | Operational implication |
| --- | --- |
| Cryptographic rule payload hashes | A verifier can detect an altered or mismatched installed rule payload. |
| Native instruction copies | Every supported agent receives the same versioned contract, rather than an undocumented prompt fragment. |
| Real browser evidence | Screenshots are captured from a target URL or HTML file instead of being self-reported by the generator. |
| Three fixed breakpoints | Responsive inspection has a repeatable baseline across mobile, tablet, and desktop. |
| Explicit network opt-in | Tier B sends screenshots to a vision provider only when the caller requests `--grade` and supplies `ANTHROPIC_API_KEY`. |
| Transient-failure handling | The standalone grader retries one transient provider failure with backoff and makes one strict JSON repair request for malformed model output. |
| Phase-0 context handoff | Existing tokens and components are presented before first-generation work to reduce duplicate or clashing primitives. |
| Exact critique relay | Generator feedback is not weakened by human or agent paraphrasing between iterations. |
| Bounded retries | The loop terminates after a deliberate cap instead of continuously editing a project. |
| Database/S3 separation | Run and rubric metadata remain queryable; large evidence assets remain in object storage. |

DesignGate does **not** automatically deploy an application, make arbitrary network calls on behalf of a generator, guarantee a design is original, or bypass human review. A caller may explicitly opt into the documented Tier B provider call with `--grade`; review all third-party assets, model output, credentials, generated code, and production changes before release.

For operational procedures, see [Operations and Release Guide](OPERATIONS.md). For the AutoClaw Desktop workflow, see [AutoClaw Desktop Integration](AUTOCLAW_DESKTOP.md). For the planned modular scaling architecture and reference-project mapping, see [Scaling Roadmap](SCALING.md).

## References

[1] [OpenClaw Skills documentation](https://docs.openclaw.ai/tools/skills) explains the `SKILL.md` model, workspace precedence, Git installation syntax, explicit `$skill` references, and the need to review third-party skills before enabling them.

[2] [AutoClaw](https://autoclaw.z.ai/) describes the desktop agent’s browser automation and web-product-building capabilities used in the integration workflow.

[3] [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) documents the API endpoint and image-message format used by the optional standalone vision-grading path.


## Immersive 3D extension and Goal Mode

DesignGate’s updated 3D support is an **additive, opt-in extension**. Activate it with `--preset gaming-3d` or `extensions.immersive3d.enabled: true`. Legacy projects preserve their existing five Tier B dimensions and report shape when the extension is disabled.

The extension manifest in `rules/extensions/immersive3d.json` adds these deterministic rule IDs:

| Rule | Contract |
| --- | --- |
| `DG-3D-001` | A browser-rendered canvas/WebGL surface is present. |
| `DG-3D-002` | A supported 3D dependency is declared, such as Three.js, React Three Fiber, Drei, or Babylon.js. |
| `DG-DEPTH-001` | The captured experience exposes depth-oriented or spatial interaction evidence. |
| `DG-INTERACT-001` | A synthetic pointer/scroll probe produces observable interaction evidence. |
| `DG-PERF-001` | The browser evidence records LCP and long-task measurements. |

Every immersive run still captures mobile, tablet, and desktop evidence. Tier B adds the conditional `immersiveness` dimension at weight `0.20`; the original five dimensions are normalized to the remaining `0.80`. The vision prompt evaluates depth, spatial hierarchy, camera/interaction affordance, and restraint. The first release evaluates browser-rendered evidence; it does not claim to inspect arbitrary mesh topology, asset licensing, AR/VR runtime behavior, or polygon budgets.

Goal Mode converts a one-line goal into a deterministic structured brief. The maintained category table currently supports **gaming**, **portfolio**, and **ecommerce**. An unknown category fails explicitly rather than selecting a hidden stack.

```bash
npx designgate@latest plan "Build a multiplayer 3D game with a cinematic lobby" --project .
npx designgate@latest build "Build a multiplayer 3D game with a cinematic lobby" \
  --generator "npm run agent:generate" \
  --project . --target http://localhost:3000 --grade
```

`plan` writes `.designgate/goal-brief.json` with the selected category, maintained stack, sections, mood keywords, required capabilities, enabled extensions, and generator prompt text. `build` passes the brief and Phase-0 context to the existing generator, renderer, verifier, inline Tier B grader, and bounded retry loop. Goal text is preserved verbatim in generator feedback. The category table is maintained in `config/goal-categories.json`; the extension contract is maintained in `rules/extensions/immersive3d.json`.

> **Opt-in and backward compatibility:** projects without Goal Mode or `immersive3d` configuration continue to use the existing `init`, `render`, `verify`, `check`, `grade`, and `loop` behavior unchanged.

### Modern motion extension

DesignGate’s modern motion support is a second **additive, opt-in extension**. Activate it with `--preset modern-motion` or `--preset modern-motion-3d`, or with `extensions.modern-motion.enabled: true`. The extension manifest in `rules/extensions/modern-motion.json` adds these deterministic rule IDs:

| Rule ID | Verifier |
| --- | --- |
| `DG-MOTION-EXT-001` | Motion library import in sources (GSAP, Framer Motion/motion.dev, or Motion One) |
| `DG-MOTION-EXT-002` | Visible choreography evidence: animation APIs, ScrollTrigger, scroll effects, stagger |
| `DG-MOTION-EXT-003` | `prefers-reduced-motion` fallback stylesheet or media query |
| `DG-MOTION-EXT-004` | Interactive states transition instead of snapping |
| `DG-MOTION-EXT-005` | Scroll choreography without horizontal overflow or broken mobile scrolling |

When the extension is active, `verify` and `grade` add a sixth Tier B dimension, `motionCraft` (weight 0.2, matching the pattern used by the `immersiveness` dimension), scored for sequenced entrances, easing personality, scroll-driven effects that enhance content, 60fps feel, and the absence of jank or over-animation. The companion preset rules (the `MM-*` IDs in `rules/presets/modern-motion.json` and `rules/presets/modern-motion-3d.json`) carry the positive direction: animated hero centerpiece, scroll storytelling on two or more sections, glow and depth language, 21st.dev-grade interactive surfaces, and single-engine motion discipline.

> **Opt-in and backward compatibility:** projects without the `modern-motion` extension or preset configuration continue to use the standard rule set and five Tier B dimensions unchanged. Legacy `immersive3d` runs remain unaffected.
