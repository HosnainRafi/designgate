# Project TODO

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
