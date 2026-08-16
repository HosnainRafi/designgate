# DesignGate Scaling Roadmap and Reference Mapping

DesignGate is intentionally useful as a single `npx` command today. This document explains how to evolve it into a maintainable, multi-project quality-gate platform without obscuring the current portable workflow.

> **Current state:** the public CLI is a deliberately compact ESM implementation in `cli/designgate.mjs`. Standalone Tier B vision grading is already available through `designgate grade`, `designgate check --grade`, and `designgate loop --grade`; it sends local mobile/tablet/desktop captures to the configured Claude-compatible endpoint and feeds exact visual critique back into the bounded generator loop. The modular layout below is a staged architecture target, not a claim that every module has already been extracted.

## Architecture target

The first scaling step is to split deterministic responsibilities by stable contracts rather than by framework. Each module should have a narrow public API and tests that exercise it without starting the web dashboard.

| Module | Responsibility | Inputs | Outputs |
| --- | --- | --- | --- |
| `context/` | Resolve project root, source revision, changed files, adapter, preset, and policy. | Working directory, CLI flags, Git metadata, `designgate.config.json`. | Normalized run context. |
| `config/` | Parse, validate, default, and migrate configuration versions. | `designgate.config.json`, preset definitions. | Typed policy, schema warnings, and config hash. |
| `rules/` | Load versioned rule manifests and compile agent instructions. | Rule payloads, adapter, preset. | Hash-validated contract and native instruction text. |
| `renderer/` | Run Playwright captures using explicit viewport and navigation policy. | Target URL/HTML, render policy. | Capture manifest and local image paths. |
| `checks/` | Evaluate deterministic Tier A checks. | Source inventory, capture evidence, installed manifest. | Typed rule checks with literal `detail` feedback. |
| `grader/` | Call an approved vision-grading provider for Tier B. | Rubric, ordered screenshots, metadata. | Dimension scores, evidence references, exact critique instructions. |
| `orchestrator/` | Coordinate run creation, capture, checks, grading, retries, and stop conditions. | Normalized context and generator runner. | Iteration state machine and final outcome. |
| `report/` | Assemble JSON, text, HTML, dashboard, and CI-friendly outputs. | Tier A, Tier B, capture, run metadata. | Schema-versioned reports and summaries. |
| `storage/` | Put/get evidence and enforce retention policies. | Object keys, byte streams, content types. | Object metadata, URLs, cleanup events. |
| `adapters/` | Translate DesignGate instruction contracts to agent-native files. | Compiled rule contract. | Deterministic managed file patches. |

The module boundaries should share versioned TypeScript schemas. For example, the renderer must not leak Playwright `Page` objects into the grader; it should return a capture manifest. Likewise, `checks/` should return the original literal feedback text, while `report/` must serialize it unchanged.

## Phased implementation plan

| Phase | Scope | Acceptance criteria |
| --- | --- | --- |
| 1. Extract pure modules | Split config, rules, adapters, renderer, checks, and report utilities out of the monolithic CLI. | CLI parity tests pass; every extracted module has direct unit coverage. |
| 2. Introduce run contracts | Add explicit schemas for `RunContext`, `CaptureManifest`, `TierAResult`, `TierBResult`, `IterationResult`, and `Report`. | CLI, API, and dashboard consume the same schema version. |
| 3. Queue expensive work | Move rendering and Tier B grading to durable worker jobs. | A web request enqueues work and returns a run ID without waiting for browser/model completion. |
| 4. Separate storage lifecycle | Formalize S3 key conventions, metadata, checksums, retention, and deletion policy. | All evidence is queryable by run/iteration and deletion is auditable. |
| 5. Harden production operation | Add authz, tenancy isolation, rate limits, observability, CI policy, and recovery playbooks. | A team can operate concurrent work safely with measurable service objectives. |

## Current no-cost control plane

The hosted dashboard now implements the control-plane foundations before a durable worker is introduced: workspace and project isolation, scoped roles, project audit events, user-triggered job records, human review states, quota checks, and manually initiated retention cleanup. This implementation intentionally uses no additional service or platform-owned model key. A request starts the work, records its state, and completes without leaving a worker online.

This is suitable for interactive, bounded team use. It is **not** a claim that expensive browser and vision work can scale indefinitely inside request handlers. Scheduled cleanup, asynchronous retry, higher concurrency, browser isolation, and unattended work remain part of the next-stage worker deployment below. See [No-Cost Team Operations](TEAM_OPERATIONS.md) for the current operating boundary.

## Worker queue and concurrency

Playwright rendering and vision grading are resource-intensive and should not execute inside request/response handlers at scale. Use a durable queue with idempotency keys.

```text
API request → create run / iteration (database)
            → enqueue capture job (idempotency: runId + iteration + revision)
worker      → capture mobile, tablet, desktop
            → upload evidence to S3
            → enqueue Tier A and Tier B jobs
workers     → write typed results
orchestrator→ decide pass, retry, or human review
reporter    → publish dashboard and CI status
```

Recommended operational rules include the following.

| Concern | Recommended control |
| --- | --- |
| Duplicate messages | Use an idempotency key containing the project, revision, run ID, and iteration. |
| Browser isolation | Run Playwright workers in restricted containers with scoped network egress, file-system limits, and a per-job timeout. |
| Parallelism | Parallelize independent projects and breakpoints only when browser capacity permits; protect the queue with concurrency limits. |
| Retries | Retry transient navigation, S3, or model failures with exponential backoff; never retry policy failures as infrastructure failures. |
| Cancellation | Store a cancellation state that workers check before navigation, upload, and grading. |
| Cost control | Limit screenshot size, page duration, model tokens, iterations, and concurrency per tenant. |

## Evidence storage and retention

S3 remains the source of truth for full-resolution PNG evidence. The database should hold queryable metadata rather than binary payloads.

| Data | Suggested representation |
| --- | --- |
| Object key | `tenants/<tenantId>/projects/<projectId>/runs/<runId>/iterations/<iteration>/<breakpoint>.png` |
| Capture metadata | Viewport, browser version, target, rendered timestamp, content type, bytes, checksum, and reduced-motion mode. |
| Database reference | Object key, immutable version/ETag where available, public-or-signed URL policy, retention deadline. |
| Security label | Tenant, sensitivity classification, and access-control policy. |
| Cleanup record | Deletion request, actor, timestamp, result, and errors. |

Use server-side encryption, least-privilege IAM policies scoped to a project prefix, and short-lived signed download URLs for private evidence. Establish a retention policy before collecting customer previews; evidence can contain personal information, test data, or confidential product screens.

## Database scaling

The existing relational model of runs, iterations, and rubric configurations should remain the query backbone. Design around immutable run facts and append-only iteration history.

| Entity | Scale-oriented guidance |
| --- | --- |
| Runs | Keep user-visible status, target/revision metadata, selected rubric, and policy snapshot immutable after completion. |
| Run iterations | Include a monotonically increasing iteration number, state, timing, score summary, error class, and evidence references. |
| Rubric configurations | Version the JSON and store a hash. Preserve the exact rubric used for every completed run. |
| Critiques | Store raw grader output separately from normalized exact generator instructions to support audit and model upgrades. |
| Projects / tenants | Add an explicit tenant and project boundary before accepting multi-customer evidence. |
| Indexes | Index `(tenant_id, project_id, created_at)`, `(run_id, iteration)`, status, and queue/worker correlation IDs. |

Use migrations for every schema alteration, backfill in bounded batches, and avoid destructive changes to evidence metadata. Database backups do not replace object-storage lifecycle management.

## Tier B vision-grading strategy

The current release provides a local Anthropic-compatible implementation for the open CLI loop. This section describes the next scaling step: extracting that working path behind a provider-agnostic interface so hosted workers and additional providers can share the same immutable rubric and capture contracts.

Vision grading should be provider-agnostic. Implement a provider interface that receives the same immutable rubric and ordered capture manifest.

```ts
interface VisionGrader {
  grade(input: {
    rubric: RubricSnapshot;
    captures: CaptureManifest;
    policy: GradingPolicy;
  }): Promise<TierBResult>;
}
```

| Decision | Recommended approach |
| --- | --- |
| Model selection | Configure a tested model by policy; avoid silently changing models across iterations of the same run. |
| Prompt versioning | Store a prompt template version and rubric snapshot with every outcome. |
| Sampling | Use low temperature or equivalent deterministic settings where the provider supports them. |
| Calibration | Maintain a human-labeled evaluation set with expected scores and critiques across mobile, tablet, and desktop. |
| Disagreement | Flag material score swings or low-confidence outcomes for human review rather than auto-retrying indefinitely. |
| Exact feedback | Preserve the grader’s approved actionable strings. The critique viewer and generator handoff must not paraphrase them. |

The five dashboard dimension names—`variance`, `motion`, `density`, `assetDependence`, and `brandFidelity`—are part of the current public evaluation contract. Add dimensions only through a rubric/schema version change with a migration and backwards-compatible report reader.

## Security model

| Threat surface | Controls |
| --- | --- |
| Untrusted targets | Isolate browser workers; block metadata endpoints and private network ranges; allowlist egress if possible; set strict navigation timeouts. |
| Prompt/skill injection | Treat webpage text, repository text, screenshot OCR, and third-party skills as data, not instructions; isolate generator command construction. |
| Generator commands | Require explicit user/team configuration; never execute a command derived from a failed check or remote page. |
| Evidence leakage | Tenant-prefix object keys, signed URLs, encryption, RBAC, audit logs, and retention/deletion controls. |
| API misuse | Authenticate APIs, authorize every run/evidence access by project, validate payload sizes/types, and rate-limit expensive endpoints. |
| Supply chain | Lock dependencies, scan releases, pin CI actions, review `SKILL.md` and Git sources before install, and verify package provenance. |

## Observability and supportability

At minimum, every run, capture, grading request, and worker attempt should share a correlation ID. Record structured logs and export metrics without logging secrets, raw evidence bytes, or user prompts unnecessarily.

| Signal | Example use |
| --- | --- |
| Queue depth and age | Detect worker starvation and missed service targets. |
| Capture success rate by breakpoint | Identify target-specific responsive or browser-navigation failures. |
| Render duration and screenshot bytes | Control performance and storage cost. |
| Tier A failure distribution | Identify common quality-contract gaps by rule ID. |
| Tier B score distribution and disagreement | Detect rubric drift or model changes. |
| Retry / cancellation counts | Locate flaky infrastructure versus genuine rule failures. |
| S3 upload/download errors | Diagnose evidence availability and lifecycle issues. |

Create traces from an API request through the capture worker, S3 upload, verification, grading, and final report. Provide run-level support bundles that include sanitized metadata, report schema version, rule/preset hash, browser version, and correlation IDs.

## CI and delivery integration

The current generated GitHub Actions workflow performs manifest installation, optional URL rendering through `DESIGNGATE_TARGET`, static verification, and artifact upload. Treat `verify-ui` as a merge requirement once it is reliable for the repository.

At scale, evolve the workflow to publish a structured summary and link to a centralized run rather than uploading only raw artifacts. Keep the CI job read-only by default: it should not write to the repository, deploy code, or make production changes.

| CI stage | Required behavior |
| --- | --- |
| Pull request | Run Tier A for changed UI-related paths; capture preview evidence only when a safe reachable preview is available. |
| Main branch | Archive a baseline report and evidence according to retention policy. |
| Release candidate | Run full Tier A/Tier B assessment, compare against a baseline, and require an explicit approval for material regressions. |
| Scheduled calibration | Regrade a fixed evaluation suite when changing models, prompts, rubrics, or browser versions. |

## Reference-project mapping and licensing

The original project brief named several public design-skill repositories. They are useful **references**, not source-code dependencies. DesignGate deliberately adds a different enforcement layer: versioned rule hashes, real multi-breakpoint browser capture, persisted evidence, deterministic checks, vision-rubric grading, and an exact-feedback retry loop.

| Reference from brief | Relevant pattern to study | DesignGate adaptation | What DesignGate adds |
| --- | --- | --- | --- |
| [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills) | Well-scoped `SKILL.md` packaging and reusable web-design guidance. | A repository-root `SKILL.md` and portable instruction contract. | Verifiable rule payloads, adapter files, renderer evidence, and CI gate. |
| 21stDev UX/UI design-skill reference | Component/design-system awareness and design-quality prompts. | Framework presets and agent-neutral instruction formatting. | Evidence-driven quality verification instead of only prompt-time guidance. |
| [owl-listener/designer-skills](https://github.com/owl-listener/designer-skills) | Design-process specialization across research, systems, UI, and delivery. | Clear workflow documentation and role-aware guidance. | A persisted closed-loop run model with Tier A/Tier B results and exact correction handoff. |

No third-party repository code, assets, proprietary brand material, or copied instruction text should be introduced into DesignGate merely because it is useful as a reference. Before adopting any external implementation:

1. Read the repository’s current license and attribution requirements.
2. Record the source, commit/version, intended use, and license decision in the pull request.
3. Prefer an independent implementation of general concepts over copying expressive text, code, data, images, or examples.
4. Include required notices when redistributing substantial licensed material.
5. Obtain legal review for licenses that are unclear, restrictive, incompatible, or business-critical.

DesignGate itself is released under the MIT License in this repository. MIT allows broad reuse when its copyright and permission notice travel with substantial copies. It provides **no warranty** and does not automatically grant rights to third-party assets, names, logos, examples, or dependencies. This is operational guidance, not legal advice.

## Definition of done for the roadmap

The scaling effort is complete only when the following are true: the CLI remains simple for a local user; all public schemas are versioned; workers are idempotent and isolated; S3 evidence is tenant-safe and lifecycle-managed; run/rubric/iteration records are queryable and durable; vision grading is calibrated and traceable; exact feedback survives every layer unmodified; CI is non-destructive; and observability can explain the fate of any run without exposing secret or private data.

For end-user operation, see [DesignGate Product Guide](GUIDE.md) and [AutoClaw Desktop Integration](AUTOCLAW_DESKTOP.md). For release and repository operations, see [Operations and Release Guide](OPERATIONS.md).
