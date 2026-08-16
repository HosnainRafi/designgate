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

DesignGate has two cooperating layers. The portable package produces source-level verification and browser evidence. The hosted dashboard persists runs, rubric configuration, iteration history, S3 evidence references, and Tier B grading results.

| Layer | Primary responsibility | Durable output |
| --- | --- | --- |
| **Rule package** | Installs agent instructions, captures screenshots, performs deterministic verification, and emits exact feedback. | `designgate.config.json`, `.designgate/manifest.json`, captures, `report.json`. |
| **Renderer** | Uses Playwright Chromium to visit a target with fixed viewports and reduced-motion emulation. | Three full-page PNG files and a capture manifest. |
| **Tier A verifier** | Inspects project artifacts, the installed manifest, and capture presence. | Per-rule pass/fail evidence, changed-file classification, and a numeric compliance score. |
| **Hosted dashboard** | Creates runs, stores run configuration and rubric configuration in the database, records iterations, and presents reports. | MySQL/TiDB run, iteration, and rubric records. |
| **Evidence storage** | Stores imported screenshot bytes outside the database. | S3 objects at `runs/<runId>/iteration-<iteration>/…` and URLs/metadata on the iteration. |
| **Tier B grader** | Grades screenshot evidence against the configured visual rubric and returns critiques. | Dimension scores, notes, and exact generator-facing instructions. |

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

Tier B is the dashboard’s screenshot-based grading layer. It considers the captured interface in context of the saved rubric rather than treating CSS text as proof of visual quality. The dashboard stores each rubric configuration in the database, associates it with a run, and retains iteration-level output for comparison.

The current grading contract surfaces these exact dimension names:

| Dimension name | What the dimension is intended to assess |
| --- | --- |
| `variance` | Whether the composition, hierarchy, and visual choices show intentional differentiation rather than generic repetition. |
| `motion` | Whether motion is purposeful, restrained, and compatible with a reduced-motion experience. |
| `density` | Whether information density, spacing, and hierarchy remain legible at the captured sizes. |
| `assetDependence` | Whether the result depends on placeholder, generic stock, or unverified external visual assets. |
| `brandFidelity` | Whether the visual system follows the run’s specified brand and design-direction expectations. |

> Tier B should be read as a structured review signal. It is not an objective proof of accessibility, legal compliance, trademark clearance, or fitness for a high-stakes domain.

The dashboard score view, critique viewer, and iteration history are designed to preserve the relationship between a capture, its rubric, its Tier A checks, and its Tier B outcome. **Fix instructions shown by the critique viewer must be forwarded to the generator verbatim.** Do not summarize or paraphrase them; the text is the review contract for the next iteration.

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
npx designgate@latest rules .
```

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

`verify` and `check` write `.designgate/report.json`. The output uses `schemaVersion: "1.2.0"` and includes a project target, timestamp, score, pass state, capture metadata when available, and per-rule checks.

```json
{
  "schemaVersion": "1.2.0",
  "target": "/workspace/product",
  "score": 78,
  "passed": false,
  "ruleSet": "designgate-modern-ui",
  "manifestVersion": "1.1.0",
  "capture": { "engine": "playwright-chromium", "captures": [] },
  "checks": [
    {
      "id": "DG-MOTION-001",
      "required": true,
      "applied": false,
      "evidence": "motion plus reduced-motion fallback",
      "payloadHashValid": true,
      "agentOutputMatching": true,
      "detail": "Missing concrete evidence for DG-MOTION-001; exact instruction: …"
    }
  ]
}
```

The literal `detail` property is the exact feedback string. Consumers should preserve it byte-for-byte when relaying it to a generator.

### Bounded loop pseudocode

The built-in loop is intentionally simple and bounded.

```text
for iteration in 1..maxIterations:
    report = verify(project)
    persist report.json
    if every required check passes:
        stop successfully

    exactFeedback = join(failed required check.detail)
    run the caller-provided generator command with:
        "DesignGate exact feedback:" + exactFeedback

exit non-zero after the limit
```

Run it only with a generator command that you trust and understand.

```bash
npx designgate@latest loop . \
  --generator "npm run agent:fix" \
  --max-iterations 5
```

The configuration file provides the persistent defaults and expected policy surface:

```json
{
  "threshold": { "overall": 3.5, "perDimensionFloor": 2 },
  "maxIterations": 5,
  "preset": "react",
  "tierA": {},
  "tierB": { "gradingModel": "auto" }
}
```

The CLI loop accepts `--max-iterations`; treat `designgate.config.json` as the project’s auditable policy record and keep its value aligned with the invocation used in CI or automation.

## Safeguards and non-goals

| Safeguard | Operational implication |
| --- | --- |
| Cryptographic rule payload hashes | A verifier can detect an altered or mismatched installed rule payload. |
| Native instruction copies | Every supported agent receives the same versioned contract, rather than an undocumented prompt fragment. |
| Real browser evidence | Screenshots are captured from a target URL or HTML file instead of being self-reported by the generator. |
| Three fixed breakpoints | Responsive inspection has a repeatable baseline across mobile, tablet, and desktop. |
| Exact critique relay | Generator feedback is not weakened by human or agent paraphrasing between iterations. |
| Bounded retries | The loop terminates after a deliberate cap instead of continuously editing a project. |
| Database/S3 separation | Run and rubric metadata remain queryable; large evidence assets remain in object storage. |

DesignGate does **not** automatically deploy an application, make arbitrary network calls on behalf of a generator, guarantee a design is original, or bypass human review. Review all third-party assets, model output, credentials, generated code, and production changes before release.

For operational procedures, see [Operations and Release Guide](OPERATIONS.md). For the AutoClaw Desktop workflow, see [AutoClaw Desktop Integration](AUTOCLAW_DESKTOP.md). For the planned modular scaling architecture and reference-project mapping, see [Scaling Roadmap](SCALING.md).

## References

[1] [OpenClaw Skills documentation](https://docs.openclaw.ai/tools/skills) explains the `SKILL.md` model, workspace precedence, Git installation syntax, explicit `$skill` references, and the need to review third-party skills before enabling them.

[2] [AutoClaw](https://autoclaw.z.ai/) describes the desktop agent’s browser automation and web-product-building capabilities used in the integration workflow.
