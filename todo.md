# Project TODO

## Updated 3D and Goal Mode requirements

- [x] Add additive immersive3d extension manifest with DG-3D-001, DG-3D-002, DG-DEPTH-001, DG-INTERACT-001, and DG-PERF-001
- [x] Add conditional Tier B immersiveness dimension with normalized six-dimension weights
- [x] Add browser evidence for canvas/WebGL, supported 3D dependency, depth interaction, synthetic interaction, LCP, and long tasks
- [x] Add Goal Mode stack decision table for gaming, portfolio, and ecommerce
- [x] Add `designgate plan` with deterministic structured goal brief and explicit unknown-category failure
- [x] Add `designgate build` with plan-to-generator prompt handoff and existing render/check/loop integration
- [x] Preserve legacy behavior when 3D extensions and Goal Mode are not enabled
- [x] Add focused tests, documentation, visual proof, full validation, public-main synchronization, and final checkpoint for the new feature set


## Standalone Tier B and public-launch hardening

- [x] Add inline CLI Tier B vision grading behind `designgate loop --grade` without requiring the hosted dashboard
- [x] Add retry/backoff and one strict JSON retry for transient standalone vision-grading API failures
- [x] Support a documented Claude-compatible bring-your-own-key vision API path with structured Tier B scores and exact critique feedback
- [x] Render mobile, tablet, and desktop evidence inside the graded CLI loop and force retries on combined Tier A and Tier B failure
- [x] Add Phase-0 context detection that inventories existing design tokens and reusable components before agents generate UI
- [x] Pass the detected Phase-0 project context to the generator before the first loop iteration and test that first-call contract
- [x] Document `gradingModel: "auto"`, provider resolution, environment variables, and safe no-key behavior plainly
- [x] Add CLI tests for inline vision grading, retry feedback, no-key behavior, and detected project context
- [x] Add genuine visual product evidence and a sample report to the README
- [x] Configure GitHub repository description, homepage, and discovery topics
- [x] Add README badges for npm, license, and verification workflow
- [x] Verify the npm publication state or replace the npm version badge with a truthful pre-publication badge
- [x] Validate the rendered README badges, documentation links, and uploaded dashboard screenshot asset
- [x] Validate all README and documentation links after the latest standalone-grading edits, including local guide links and public references
- [x] Run a complete Markdown link-validation pass across README.md and docs/*.md, including relative destinations, anchor fragments, badges, and public URLs
- [x] Decide whether to rename the public repository from `AI-fine-graded` to `designgate` after documenting migration implications
- [x] Document the DesignGate repository rename, GitHub redirect behavior, canonical URL, local-remote update, and downstream reference updates
- [x] Validate the renamed public repository end-to-end across README/docs/package metadata/workflow badge/skill installation/local remote/public URL
- [x] Validate the standalone CLI path, documentation links, tests, build, and public GitHub synchronization
- [x] Save and publish the final standalone-grading checkpoint

- [x] Persist run configurations with target, generator command, max iterations, threshold, status, timestamps, and iteration history
- [x] Persist rubric configurations in the database under the exact config filename designgate.config.json
- [x] Add typed backend procedures for runs, iterations, rubric configs, report retrieval, and exports
- [x] Build dashboard home with run history list and status/score summaries
- [x] Build New Run form with persisted configuration fields and validation
- [x] Build run detail page with overall score gauge, verdict, iteration timeline, Tier A checks, Tier B dimensions, critiques, and screenshots
- [x] Add exact Tier A labels: fonts, gradients, spacing, contrast, responsive, icons
- [x] Add exact Tier B dimension labels: variance, motion, density, assetDependence, brandFidelity
- [x] Add rubric config editor for thresholds, maxIterations, Tier A severities, Tier B weights, and grading model
- [x] Add responsive navigation with clear active state and logout action
- [x] Add S3-backed screenshot storage for mobile, tablet, and desktop breakpoints on every iteration
- [x] Add deterministic Tier A check execution and typed results
- [x] Add vision-capable Tier B grading with structured JSON scores and notes
- [x] Add retry orchestration with exact generator feedback strings and iteration cap
- [x] Add structured critique viewer showing exact fix instruction strings passed to the generator
- [x] Add JSON and human-readable report export downloads
- [x] Add Vitest coverage for core backend procedures, scoring, critique formatting, and config persistence
- [x] Validate responsive layouts, typecheck, tests, and production build
- [x] Save the final project checkpoint for delivery

## Follow-up implementation gaps

- [x] Replace all sample and hardcoded run, iteration, Tier A, Tier B, and critique data with persisted query data plus loading, error, and empty states
- [x] Implement real renderer/check/orchestrator flow with screenshots each iteration, deterministic Tier A checks, Tier B grading, persisted results, generator retries, and maxIterations enforcement
- [x] Add a real logout action to the app shell and bind detail, critique, and export UI to persisted run data only
- [x] Upgrade the rubric editor to validated field-based editing or strict JSON validation with load/save of the stored designgate.config.json
- [x] Add backend tests for run creation/retrieval, rubric persistence, grading/report assembly, and retry orchestration
- [x] Validate the overview and run-detail layouts at mobile, tablet, and desktop breakpoints
- [x] Capture explicit multi-viewport evidence for responsive validation before final delivery
- [x] Capture mobile and tablet screenshots for the run-detail route with a persisted run id
- [x] Review the run-detail responsive evidence and update the validation items accurately

## Installable agent-quality-gate expansion

- [x] Add an npx-style package entrypoint with install, init, check, loop, rules, and verify commands
- [x] Package portable modern design, animation, responsive, accessibility, typography, asset, and anti-generic rules as versioned skills/rules
- [x] Add agent-harness adapters and compiled instruction outputs for Claude Code, Cursor, Codex CLI, Gemini CLI, Copilot, and generic agents
- [x] Add a designgate.config.json initializer and project-local rule installation flow
- [x] Add an instruction manifest with rule IDs, versions, hashes, required/optional status, and exact prompt payloads
- [x] Add instruction-application verification that checks agent outputs, changed files, tokens, motion, responsive behavior, and rule coverage
- [x] Add old-model compatibility mode with concise layered prompts, deterministic checks, and retry-safe feedback
- [x] Add CLI documentation and copy-paste installation examples for any coding agent
- [x] Update the dashboard to show installed rules, agent adapter, instruction compliance score, and verification history
- [x] Add tests for package commands, rule compilation, adapter output, instruction verification, and compatibility mode
- [x] Re-run typecheck, tests, build, and responsive validation after the installable-agent expansion
- [x] Save the final installable-agent checkpoint for delivery

## Installable-agent hardening gaps

- [x] Add per-rule payload hashes and explicit prompt payload objects to the instruction manifest
- [x] Upgrade CLI verification to inspect concrete artifact evidence for tokens, motion, responsive behavior, changed files, and agent-applied output
- [x] Bind the dashboard install/compliance panel to live project verification state instead of static adapter labels
- [x] Expand CLI tests for per-rule hashes, adapter compilation, compatibility mode, and concrete verification evidence
- [x] Capture fresh responsive validation evidence after the installable-agent dashboard update
- [x] Save a new checkpoint after installable-agent hardening is complete

## Final audit corrections

- [x] Compute cryptographic per-rule hashes from each exact payload and assert them in tests
- [x] Make verifier artifact evidence include changed-file classification, agent output manifest matching, and concrete token/motion/responsive checks
- [x] Persist installer/verifier state through a project-facing status contract used by the dashboard
- [x] Add tests for hash validity, compatibility feedback, and concrete verifier evidence paths
- [x] Capture a fresh tablet preview after the final dashboard change
- [x] Save the final audited checkpoint after all corrections

## Npm publishing, real renderer, and CI expansion

- [x] Prepare npm distribution metadata, package contents, release scripts, and publication documentation
- [x] Add a real Playwright renderer that captures desktop, tablet, and mobile screenshots for URL and local targets
- [x] Store renderer evidence in the existing S3-backed iteration format and surface capture metadata in reports
- [x] Generate native agent instruction files for Claude Code, Cursor, Codex CLI, Gemini CLI, Copilot, and generic projects
- [x] Generate pull-request CI enforcement for GitHub Actions with install, render, verify, and report-artifact steps
- [x] Add tests for package publication contents, renderer contracts, instruction writers, and CI workflow generation
- [x] Re-run typecheck, tests, build, CLI smoke tests, and responsive UI validation
- [x] Save the final npm-renderer-CI checkpoint for delivery

## Release evidence hardening

- [x] Add a project-side evidence import contract that persists Playwright capture metadata into the existing run-iteration S3 evidence flow and returns it in reports
- [x] Add automated package-content assertions for the publishable npm tarball contract
- [x] Re-run end-to-end CLI, application, package, and responsive validation after release evidence hardening
- [x] Save the final npm-renderer-CI checkpoint after release evidence hardening

## Final package audit

- [x] Add an automated `npm pack --dry-run --json` tarball-content assertion
- [x] Capture fresh desktop, tablet, and mobile DesignGate previews after release hardening
- [x] Save the final audited npm-renderer-CI checkpoint

## Final release preservation

- [x] Save the audited npm-renderer-CI package state in a final checkpoint

## GitHub release distribution

- [x] Review repository documentation, licensing, package metadata, and ignored files for external distribution
- [x] Superseded by the user’s request for public distribution
- [x] Push the complete DesignGate source, rules, CLI, workflows, tests, and usage documentation without secrets
- [x] Verify the repository contents and share the repository location

## Public GitHub distribution change

- [x] Superseded by pushing to the user-created public repository
- [x] Push the audited DesignGate package and all documentation to the public repository without exposing credentials
- [x] Verify public repository visibility and expected files, then provide its URL

## Existing public repository push

- [x] Set the repository remote to https://github.com/HosnainRafi/AI-fine-graded.git without duplicating origin
- [x] Push the complete audited DesignGate source and documentation to the main branch
- [x] Verify the remote branch and key repository contents

## GitHub write-access retry

- [x] Validate the newly supplied GitHub token against the GitHub API
- [x] Confirm write permission for HosnainRafi/AI-fine-graded
- [x] Push the complete DesignGate main branch if authorized
- [x] Verify the remote branch and repository contents or document the exact permission fix required

## Release operations and framework presets

- [x] Add React, Next.js, Vue, and component-library preset manifests with tailored rules and prompts
- [x] Add preset selection to CLI init/rules/verify flows and document usage
- [x] Add npm publication readiness checks, version/release scripts, and clean-project smoke coverage
- [x] Add GitHub Actions quality-gate workflow and required-check documentation
- [x] Configure branch protection on HosnainRafi/designgate with verify-ui and one required approval
- [x] Run typecheck, tests, build, npm dry-run, and clean-project `npx designgate init .` validation
- [x] Save the final release-operations checkpoint

## Release-operations validation gaps

- [x] Run pnpm build after the preset, workflow, npm metadata, and branch-protection helper changes
- [x] Save a new checkpoint after release-operations validation is complete

## Comprehensive documentation and scalable adoption (initial tracking)

- [x] Create a full product guide explaining DesignGate architecture, commands, evidence flow, grading loop, reports, and safeguards
- [x] Create an AutoClaw Desktop guide for installing and using DesignGate on any website or software project
- [x] Document agent adapters, native instruction files, presets, loop integration, and old-model operating mode
- [x] Add a reference-project mapping, licensing guidance, and clear distinction between adapted patterns and DesignGate’s novel enforced loop
- [x] Add a practical repository-scaling roadmap covering modular CLI architecture, worker queue, storage, database, vision grading, security, observability, and CI
- [x] Add troubleshooting, release, npm publishing, S3 evidence-import, and branch-protection operations documentation
- [x] Add a documented update-and-push procedure and push each validated documentation update to GitHub
- [x] Validate documentation links, package commands, tests, build, and repository synchronization
- [x] Save the final documentation checkpoint and provide the completed guide

## Comprehensive documentation and scalable adoption (active tracking)

- [x] Fix the protected-branch `verify-ui` workflow so pnpm is available before `actions/setup-node` enables the pnpm cache
- [x] Prevent Markdown documentation text from causing false deterministic UI-rule failures in the protected `verify-ui` workflow
- [x] Create a full product guide explaining DesignGate architecture, commands, evidence flow, grading loop, reports, and safeguards
- [x] Create an AutoClaw Desktop guide for installing and using DesignGate on any website or software project
- [x] Document agent adapters, native instruction files, presets, loop integration, and old-model operating mode
- [x] Add a reference-project mapping, licensing guidance, and clear distinction between adapted patterns and DesignGate’s novel enforced loop
- [x] Add a practical repository-scaling roadmap covering modular CLI architecture, worker queue, storage, database, vision grading, security, observability, and CI
- [x] Add troubleshooting, release, npm publishing, S3 evidence-import, and branch-protection operations documentation
- [x] Add a documented update-and-push procedure and push each validated documentation update to GitHub
- [x] Validate documentation links, package commands, tests, build, and repository synchronization
- [x] Save the final documentation checkpoint and provide the completed guide

## Critical remediation audit

- [x] Re-audit and, if needed, wire standalone Tier B vision grading into the open `designgate loop --grade` path with retry feedback and tests
- [x] Verify and update the public GitHub repository name, description, homepage, and discovery topics
- [x] Add genuine visual proof, a sample report, and truthful npm/license/CI badges to README.md
- [ ] Run full validation, push the remediation branch, merge into protected main, restore protection, and save a final checkpoint
