# AutoClaw Desktop Integration Guide

This guide explains how to use DesignGate as a repeatable visual-quality gate while building **any website or software project** with AutoClaw Desktop. It supports a practical division of labor: AutoClaw and its selected coding model generate or modify the project, while DesignGate adds a versioned UI contract, Phase-0 project context, browser captures, deterministic Tier A checks, optional inline Tier B vision grading, and bounded feedback cycles.

> AutoClaw is a desktop agent for macOS and Windows that can operate tools, browsers, local files, and web-product-building workflows. DesignGate is not a model plugin; it is a project-local instruction and verification layer that AutoClaw can invoke. [1]

## Before you begin

| Requirement | Why it is needed |
| --- | --- |
| AutoClaw Desktop installed and signed in | Provides the desktop agent workspace and task execution environment. |
| Node.js and npm/npx reachable from the project environment | Needed for `npx` and Playwright-based rendering. |
| A local project workspace | Holds the DesignGate configuration, generated instruction files, captures, and report. |
| A runnable web preview | Required for browser screenshots of an application route. |
| `ANTHROPIC_API_KEY` when using visual grading | Required only for `--grade`; keeps the complete Tier B loop standalone from the hosted dashboard. |
| A human reviewer for final release decisions | DesignGate measures evidence and rubric results; it does not replace approval. |

For the source-based skill flow, clone the public repository once into a location AutoClaw can access:

```bash
git clone https://github.com/HosnainRafi/designgate.git
```

## Install as an OpenClaw skill

The repository now includes a root `SKILL.md`, so it can be installed from Git into an OpenClaw-compatible workspace.

```bash
openclaw skills install git:HosnainRafi/designgate@main --as designgate
```

OpenClaw installs Git skills into the active workspace’s `skills/` directory by default. Use the following command only when the user intentionally wants the skill visible to all local agents.

```bash
openclaw skills install git:HosnainRafi/designgate@main --as designgate --global
```

Before enabling a Git-sourced skill, inspect the repository and its `SKILL.md`. OpenClaw explicitly treats third-party skills as untrusted code and recommends reviewing them before use. [2]

### Invoke the skill in AutoClaw

In an AutoClaw conversation, type `$` and select **designgate** from the skill picker, or include `$designgate` in the prompt. OpenClaw resolves the explicit skill reference and makes the skill instructions available for that task. [2]

```text
Use $designgate to build the settings dashboard in this workspace.
Install the React preset, implement the requested design, start the preview,
capture mobile/tablet/desktop evidence, run the gate, and show me the exact
failed DesignGate instructions if anything is not compliant.
```

Do not ask AutoClaw to “make it modern” without a concrete product brief. Provide the page purpose, users, content hierarchy, brand direction, routes, interaction expectations, and acceptance constraints. DesignGate will enforce a common baseline; it cannot infer missing business requirements.

## Install the DesignGate project contract

From the target project root, use the package form after the package has been published to npm under the documented name. Until then, or when working directly from this repository, use the source CLI form.

| Project type | Package command after npm publication | Source-repository command |
| --- | --- | --- |
| React | `npx designgate@latest init . --agent generic --preset react` | `node /path/to/designgate/cli/designgate.mjs init . --agent generic --preset react` |
| Next.js | `npx designgate@latest init . --agent generic --preset nextjs` | `node /path/to/designgate/cli/designgate.mjs init . --agent generic --preset nextjs` |
| Vue | `npx designgate@latest init . --agent generic --preset vue` | `node /path/to/designgate/cli/designgate.mjs init . --agent generic --preset vue` |
| Shared component library | `npx designgate@latest init . --agent generic --preset component-library` | `node /path/to/designgate/cli/designgate.mjs init . --agent generic --preset component-library` |
| Other web project | `npx designgate@latest init . --agent generic --preset base` | `node /path/to/designgate/cli/designgate.mjs init . --agent generic --preset base` |

If AutoClaw is delegating coding to a supported harness, select its adapter instead of `generic`: `claude-code`, `cursor`, `codex-cli`, `gemini-cli`, or `copilot`. The initializer still emits every native instruction file so the repository remains portable.

After initialization, instruct AutoClaw to read `designgate.config.json`, `.designgate/project-context.json`, and the relevant native instruction file before editing. The context inventory records existing design tokens and reusable components so AutoClaw can reuse them instead of introducing a conflicting replacement. These files are the durable project contract, not an invisible prompt assumption.

## Recommended end-to-end workflow

### 1. Give AutoClaw a precise build brief

Use a prompt that ties the feature request to an observable verification workflow.

```text
Use $designgate in the current project. Build a responsive account settings page
for a B2B SaaS product. Use the existing design tokens and components; do not add
placeholder imagery. Include an accessible profile form, a security section, and
an audit-log preview. Respect reduced motion. Then start the preview, render the
page at all DesignGate breakpoints, run the check, and report the exact failed
instructions before attempting any correction.
```

### 2. Build and run the preview

AutoClaw should use the project’s existing package scripts. The exact start command differs by repository; DesignGate needs the resulting reachable URL, not a specific framework command.

```bash
# Example only; use the project’s documented preview command.
pnpm dev
```

### 3. Capture browser evidence

Install Playwright Chromium once in the environment that will run the capture.

```bash
npx playwright install chromium
npx designgate@latest render http://localhost:3000 --project .
```

The renderer creates full-page evidence at **mobile 390 × 844**, **tablet 834 × 1112**, and **desktop 1440 × 1000**. The generated `.designgate/latest-capture.json` is the capture record consumed by local checks and evidence import.

### 4. Run the standalone Tier A plus Tier B gate

```bash
export ANTHROPIC_API_KEY="your-key"
npx designgate@latest check http://localhost:3000 --project . --grade
```

The command renders mobile, tablet, and desktop evidence, performs deterministic Tier A verification, and sends those three captures to the Claude-compatible vision API for Tier B only because `--grade` was requested. The combined report is written to `.designgate/report.json`. A failing process exit code is expected when a required rule lacks evidence or the visual score is below its configured threshold; it tells AutoClaw that the build must not be declared complete.

Without an API key, use the deterministic-only command `npx designgate@latest check http://localhost:3000 --project .`. A requested `--grade` with no `ANTHROPIC_API_KEY` fails safely before any provider request; it never silently becomes Tier A-only.

### 5. Correct only from exact feedback

AutoClaw should read every required failed check and forward the `detail` properties without any paraphrase. An effective correction prompt is:

```text
The DesignGate check failed. Apply only the following exact instructions to the
current project. Do not paraphrase them, do not remove unrelated functionality,
and report each changed file when complete:

<paste the failed detail strings here exactly>
```

After the change, rerun the combined gate. The bounded visual loop can perform the same pattern automatically: it sends Phase-0 context to AutoClaw before its first generation attempt, then renders and grades each iteration.

```bash
npx designgate@latest loop . \
  --generator "npm run agent:fix" \
  --grade --target http://localhost:3000 \
  --max-iterations 5
```

Stop at the project’s configured or explicitly requested iteration limit. If the remaining concern is aesthetic judgment, brand suitability, accessibility semantics, or product intent rather than a deterministic or stated visual-rubric failure, ask the user for review rather than forcing repeated edits.

## Use with the hosted DesignGate dashboard

The local AutoClaw workflow is sufficient for standalone Tier A and Tier B grading. Use the hosted dashboard when the team additionally needs run history, persisted rubric configurations, score comparison, critique review, exports, and durable S3-backed evidence records.

1. Create a run and iteration in the dashboard.
2. Render the project locally with DesignGate.
3. Generate the typed import payload:

   ```bash
   npx designgate@latest evidence . --run-id 42 --iteration 1
   ```

4. Submit `.designgate/evidence-import.json` through the dashboard’s evidence-import flow.
5. The server stores the mobile, tablet, and desktop PNG bytes in S3 under `runs/<runId>/iteration-<iteration>/` and retains the screenshot metadata, run configuration, rubric configuration, Tier A result, Tier B result, and exact critique in durable records.
6. Use the dashboard critique viewer as the source of truth for the next generator prompt. Relay the displayed fix instruction exactly as stored.

## Prompt templates

| Situation | AutoClaw prompt |
| --- | --- |
| New page | `Use $designgate. Install the <preset> preset, build <feature> from this specification, capture all three breakpoints, run the gate, and do not call the work complete unless the report passes or you list the exact unresolved instructions.` |
| Existing-page redesign | `Use $designgate to redesign <route> while preserving existing functionality and content. Read the installed contract first. Render before and after changes, then return the exact failed rule details if any.` |
| Component-library contribution | `Use $designgate with the component-library preset. Implement <component>, preserve token APIs and accessible states, render the documentation/example route at all breakpoints, and run the verification report.` |
| Older model | `Use $designgate. Work on one failed rule at a time. First read the native instruction file and report the next exact failed detail. Modify only the necessary files, then rerun the check.` |

## Troubleshooting

| Symptom | Likely cause | Resolution |
| --- | --- | --- |
| `$designgate` is not offered | The skill was installed in another workspace, was restricted by an allowlist, or needs an OpenClaw refresh. | Confirm the active workspace, review its `skills/` directory and allowlist configuration, then reinstall the Git skill if necessary. |
| `npx designgate@latest` fails | The npm package has not yet been published under that name, the registry lacks access, or Node/npm is unavailable. | Use the checked-out source command (`node /path/to/designgate/cli/designgate.mjs …`) until npm publication is complete. |
| Browser render fails | Chromium is unavailable, the target server is down, the URL is unreachable, or the route never becomes idle. | Run `npx playwright install chromium`; start the preview; verify the URL from the same environment; avoid using a private URL unreachable from the execution host. |
| `verify` fails after installation | A required project artifact lacks detectable evidence. | Read `.designgate/report.json`, then give AutoClaw the exact failed `detail` strings. |
| `--grade` reports a missing API key | The CLI was asked to perform direct Tier B grading without a local Claude-compatible credential. | Set `ANTHROPIC_API_KEY`, then rerun the command. Do not paste the key into an AutoClaw prompt, source file, or report. |
| Tier B returns an API error | The configured model, base URL, network, or account access rejected the request. | Check `ANTHROPIC_BASE_URL`, `DESIGNGATE_ANTHROPIC_MODEL`, and provider account access. The CLI retries one transient failure and one malformed-JSON response automatically. |
| Dashboard has no screenshots | The evidence payload was not generated from a successful capture or the run/iteration identifiers do not exist. | Run `render`, then `evidence` with the correct IDs and submit the resulting payload through the import flow. |
| Critique becomes vague after delegation | A mediator rewrote the review. | Copy the exact critique-viewer fix instruction directly into the next generator prompt. |

## Security and operating boundaries

Do not grant AutoClaw more local filesystem, browser, repository, credential, or publishing access than the project requires. Review generated Git changes before merging; inspect agent-proposed shell commands; keep production secrets out of prompts and reports; and treat remote skills and generator commands as untrusted until reviewed. The bounded loop must not be pointed at an arbitrary command supplied by an untrusted issue, webpage, or model output.

For the complete CLI reference and report contract, read [DesignGate Product Guide](GUIDE.md). For scalability and CI operations, read [Scaling Roadmap](SCALING.md) and [Operations and Release Guide](OPERATIONS.md).

## References

[1] [AutoClaw official site](https://autoclaw.z.ai/).

[2] [OpenClaw Skills documentation](https://docs.openclaw.ai/tools/skills).
