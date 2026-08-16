# DesignGate

DesignGate is an **installable, agent-agnostic UI quality gate**. It gives a coding agent explicit modern-design rules, captures real browser evidence at mobile, tablet, and desktop widths, and verifies project artifacts instead of trusting an agent’s self-report.

## Install into any agent project

```bash
npx designgate@latest init . --agent claude-code
```

The initializer writes `designgate.config.json`, an auditable `.designgate/manifest.json`, every compiled adapter under `.designgate/agents/`, native agent instruction files, and `.github/workflows/designgate.yml`.

| Agent harness | Native instruction file |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/designgate.mdc` |
| Codex CLI | `AGENTS.md` |
| Gemini CLI | `GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Generic | `DESIGNGATE.md` |

## Capture real browser evidence

Render a running URL or a local HTML file. The renderer uses Playwright Chromium and saves full-page PNGs at **390×844**, **834×1112**, and **1440×1000** along with a capture manifest.

```bash
npx playwright install chromium
npx designgate@latest render http://localhost:3000 --project .
npx designgate@latest render ./preview/index.html --project .
npx designgate@latest evidence . --run-id 42 --iteration 1
```

The images and metadata are written below `.designgate/captures/`; `.designgate/latest-capture.json` is consumed by the verification report. For the hosted DesignGate application, upload those three files through the run evidence flow so its existing S3-backed iteration record can display and grade them.

`evidence` prepares the typed payload at `.designgate/evidence-import.json`. Submit that payload to the hosted app’s public `runs.importEvidence` procedure after a matching run iteration exists. The procedure stores the three image bytes in S3 at `runs/<runId>/iteration-<iteration>/`, replaces the iteration’s screenshot map with URL-plus-capture metadata, and exposes it through the report API.

## Verify and enforce

```bash
npx designgate@latest verify .
npx designgate@latest check http://localhost:3000 --project .
npx designgate@latest loop . --generator "npm run agent:fix" --max-iterations 5
```

`verify` creates `.designgate/report.json` with per-rule payload hashes, evidence details, classified changed files, adapter-manifest matching, optional capture metadata, and exact generator feedback. The bounded `loop` stops on compliance or after the configured iteration cap.

## GitHub pull-request gate

`init` creates a GitHub Actions workflow that installs Chromium, initializes DesignGate, optionally renders the URL held in the repository variable `DESIGNGATE_TARGET`, verifies the quality contract, and uploads the report as a workflow artifact. Set `DESIGNGATE_TARGET` to a preview URL reachable from GitHub Actions; otherwise the workflow still performs static rule verification.

## Publishing to npm

The repository is configured as a public package with a `bin` entrypoint and a `prepack` guard. Use an npm account that owns the intended package name:

```bash
pnpm install
pnpm test
pnpm build
pnpm pack --dry-run --json --ignore-scripts
npm login
npm publish --access public
```

If `designgate` is already taken, set a scoped name such as `@your-org/designgate` in `package.json` and publish with `npm publish --access public`. This repository prepares and validates the release, but publishing itself requires the package owner’s npm credentials and approval.

## Compatibility with older models

The generated instructions are **layered and deterministic**: inspect, apply tokens and responsive layout, add motion safely, report changed files/rule IDs, then verify. When a gate fails, DesignGate passes the exact missing instruction back to the generator. This keeps weaker or older models on a short, reproducible correction loop instead of giving them vague design feedback.

## Rule contract

Each portable rule has a stable ID, category, required/optional status, exact instruction payload, and cryptographic payload hash. Core coverage includes typography, semantic color, layout hierarchy, motion, responsive behavior, accessibility, asset discipline, component reuse, and completion verification.

## Framework presets

DesignGate can install the portable core rules plus a framework-specific preset:

```bash
npx designgate@latest init . --preset react
npx designgate@latest init . --preset nextjs
npx designgate@latest init . --preset vue
npx designgate@latest init . --preset component-library
npx designgate@latest rules .
```

The selected preset is recorded in `.designgate/manifest.json`, included in native agent instruction files, and exposed by `designgate rules` for audit tooling.

## Clean-project npm smoke test

Before publishing a release, run the repository checks and validate the actual package contents:

```bash
pnpm check
pnpm test
npm pack --dry-run --json --ignore-scripts
```

Then test the command shape in an empty directory:

```bash
mkdir /tmp/designgate-clean && cd /tmp/designgate-clean
npx designgate@latest init . --preset react
npx designgate@latest rules .
```

Publishing requires an npm account with permission for the package name:

```bash
npm login
npm publish --access public
```

## Branch protection

The generated workflow exposes the `verify-ui` check. In GitHub, protect `main` by requiring pull requests, at least one approval, passing status checks including `verify-ui`, stale-review dismissal, conversation resolution, linear history, and blocking force pushes and branch deletion. Programmatic branch-protection changes require a token with repository administration permission; the current publishing credential can push code but returned `403 Resource not accessible by personal access token` for the protection API, so apply this policy from **Settings → Branches** or use an administrator-scoped token.

For administrators who want to apply the policy by API instead of the GitHub UI:

```bash
GITHUB_TOKEN=ghp_... npm run github:protect
```

The token must have repository administration permission. The command requires the `verify-ui` check, one approving review, stale-review dismissal, conversation resolution, linear history, and blocks force pushes and deletion. Override `DESIGNGATE_GITHUB_OWNER`, `DESIGNGATE_GITHUB_REPO`, and `DESIGNGATE_GITHUB_BRANCH` for another repository.
