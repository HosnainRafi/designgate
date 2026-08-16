# DesignGate

DesignGate is an installable, agent-agnostic UI quality gate. It gives any coding agent a portable modern-design skill, then verifies the result instead of trusting the model's self-report.

## Install into any agent project

```bash
npx designgate init . --agent generic
```

Supported adapter labels are `claude-code`, `cursor`, `codex-cli`, `gemini-cli`, `copilot`, and `generic`. The initializer creates `designgate.config.json`, a versioned `.designgate/manifest.json`, and compiled instruction files under `.designgate/agents/`.

## Verify rule application

```bash
npx designgate verify .
npx designgate rules .
```

Verification reports the installed manifest hash, rule IDs, evidence found in the project, exact missing instructions, and a compliance score. The report is written to `.designgate/report.json`.

## Run the quality loop

```bash
npx designgate loop . --generator "npm run agent:fix" --max-iterations 5
```

The loop performs a deterministic verification pass, emits exact feedback strings for missing rules, re-invokes the generator, and stops when the configured threshold is met or the iteration cap is reached. For a production renderer, pair this package with a headless-browser capture adapter that feeds mobile, tablet, and desktop evidence into the DesignGate dashboard's Tier A and Tier B flow.

## Compatibility with older models

The generated skill uses layered instructions: inspect first, implement in small phases, state changed files and rule IDs, then verify. The CLI keeps feedback concise and deterministic, so weaker models receive one exact fix payload instead of a vague request to improve the design. A generator can be any command that accepts an appended instruction string.

## Rule contract

Every rule has a stable ID, category, required/optional status, versioned manifest, exact instruction text, and evidence check. The core rules cover typography, semantic color, layout hierarchy, motion, responsive behavior, accessibility, asset discipline, component reuse, and completion verification.

## Important distinction

DesignGate does not claim that instructions were followed merely because an agent says so. It checks the project artifacts and records the missing evidence. Render-grade verification remains the authoritative final gate for visual quality.
