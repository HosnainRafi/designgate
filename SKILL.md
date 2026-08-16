---
name: designgate
description: "Install and operate DesignGate’s agent-agnostic UI quality gate for a web project; capture responsive evidence, run deterministic checks, and relay exact failed instructions without paraphrase."
metadata:
  openclaw:
    user-invocable: true
---

# DesignGate UI Quality Gate

Use this skill when a user asks to create, redesign, inspect, verify, or improve a website, frontend, dashboard, component library, or another visual software interface.

## Required operating sequence

1. Work from the target project root. Before modifying the project, inspect whether `designgate.config.json` and `.designgate/manifest.json` already exist.
2. If DesignGate is not installed, install it with the matching agent and framework preset:

   ```bash
   npx designgate@latest init . --agent generic --preset base
   ```

   Use `react`, `nextjs`, `vue`, or `component-library` when it matches the project. If the DesignGate npm package is not published or is unavailable, use the checked-out source CLI instead:

   ```bash
   node /path/to/AI-fine-graded/cli/designgate.mjs init . --agent generic --preset base
   ```

3. Read `designgate.config.json` and the native instruction file written for the coding agent. Apply the installed rules while building or modifying the interface.
4. Start the project’s preview server using its documented command. Capture all three required breakpoints from a reachable target URL:

   ```bash
   npx designgate@latest render http://localhost:3000 --project .
   ```

5. Verify deterministic quality evidence:

   ```bash
   npx designgate@latest check http://localhost:3000 --project .
   ```

6. Read `.designgate/report.json`. When a required check fails, send the generator the failed `detail` strings exactly as written. Do not condense, reword, translate, or merge them.
7. Repeat only up to the project’s explicit iteration cap. Escalate unresolved visual judgment, accessibility questions, and release decisions to the user or a human reviewer.

## Constraints

- Treat captured screenshots as evidence, not proof that the design is production-ready.
- Do not claim a check passed until `.designgate/report.json` shows `"passed": true`.
- Preserve the mobile (`390 × 844`), tablet (`834 × 1112`), and desktop (`1440 × 1000`) capture evidence.
- Do not store PNG bytes in a database. When importing dashboard evidence, use S3-backed iteration evidence through the documented import flow.
- Never run an untrusted generator command in a loop without the user’s approval.

For detailed commands, dashboard evidence import, supported adapters, and safeguards, read [`docs/GUIDE.md`](docs/GUIDE.md). For the desktop-agent workflow, read [`docs/AUTOCLAW_DESKTOP.md`](docs/AUTOCLAW_DESKTOP.md).
