# DesignGate Operations and Release Guide

This guide covers project maintenance, evidence import, troubleshooting, npm release operations, GitHub synchronization, and branch-protection setup.

## Day-to-day maintainer workflow

Every documentation or code update should be validated, committed, and pushed deliberately. Avoid mixing unrelated changes in a single commit.

```bash
cd /home/ubuntu/designgate
git status --short
pnpm check
pnpm test
pnpm build
git add <intended-files>
git commit -m "docs: describe DesignGate workflow"
git switch -c docs/describe-designgate-workflow
git push -u origin HEAD
gh pr create --base main --fill
git status --short
git log -1 --oneline
```

Before pushing, inspect the staged diff and confirm that it contains no secrets, generated browser captures, `.designgate/evidence-import.json`, database dumps, or local environment files. The public `main` branch is protected, so merge only a passing reviewed pull request. Keep the working tree clean after the push so the repository state is easy to reproduce.

## Validated update-and-push procedure

Use this procedure for every validated DesignGate update, including documentation-only changes. First run `git diff --check`, `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm validate:docs`. Next inspect `git status --short` and the staged diff for credentials, local captures, generated evidence, or unrelated files. Create a dedicated branch from the current `public/main`, commit only the validated change, and push it with `git push -u public HEAD`. Open a pull request into `main`, wait for the required `verify-ui` check, and merge using the repository’s configured linear-history strategy. After the merge, fetch `public/main`, confirm the expected files and commit are present, and verify that branch protection still requires one approval and the `verify-ui` status check. Save a project checkpoint only after this remote verification is complete.

For this repository, the canonical commands are:

```bash
git fetch public main
git switch -c feature/<short-name> public/main
pnpm check && pnpm test && pnpm build && pnpm validate:docs
git add <intended-files>
git commit -m "<scoped change>"
git push -u public HEAD
gh pr create --repo HosnainRafi/designgate --base main --fill
# After verify-ui passes and review/protection requirements are satisfied:
gh pr merge <number> --repo HosnainRafi/designgate --rebase
```

Never force-push a protected branch or bypass review requirements unless the repository owner has explicitly authorized a temporary administrative operation. If an administrative bypass is used, restore the original branch-protection policy immediately after the merge.

## Evidence-import operations

The local CLI captures raw PNGs in `.designgate/captures/` and writes a Base64 import payload. Use the following sequence only after the dashboard contains the intended run and iteration IDs.

```bash
npx playwright install chromium
npx designgate@latest render http://localhost:3000 --project .
npx designgate@latest evidence . --run-id 42 --iteration 1
```

| Checkpoint | Expected result |
| --- | --- |
| Renderer complete | `.designgate/latest-capture.json` contains `mobile`, `tablet`, and `desktop`. |
| Payload complete | `.designgate/evidence-import.json` contains three `image/png` Base64 values and the intended run/iteration identifiers. |
| Server import complete | S3 contains the evidence under `runs/<runId>/iteration-<iteration>/`; the database iteration references URLs and capture metadata. |
| Dashboard visible | The run detail view shows all three screenshots, Tier A/Tier B status, and the precise critique. |

The application must keep **run configurations and rubric configurations in the database**. Keep screenshot bytes in S3; store only keys, URLs, content types, sizes, viewport metadata, and related evidence facts with the iteration.

## Troubleshooting matrix

| Problem | Diagnostic | Safe resolution |
| --- | --- | --- |
| `render` cannot find Chromium | `npx playwright install chromium` has not run for this environment. | Install Chromium, then rerun the capture. |
| `render` cannot reach the target | The preview server is not running, wrong port, URL requires login, or network isolation blocks access. | Start the local preview; use a reachable test route; avoid embedding credentials in commands or reports. |
| Local directory render error | Only a directory with `index.html` is valid; application directories need a running URL. | Use the local HTML file or start the framework preview and pass its URL. |
| `verify` returns non-zero | One or more required deterministic rules lack concrete evidence. | Inspect `.designgate/report.json`; send failed `detail` strings exactly to the generator; rerun after correction. |
| Evidence import fails | Wrong run/iteration ID, no capture, malformed payload, or S3/server authorization issue. | Validate the capture manifest and IDs first; review server logs and S3 permissions without exposing credentials. |
| Tier B result seems inconsistent | Rubric, capture order, model/prompt version, or evidence may differ. | Compare stored rubric/config snapshots and evidence; route material disagreement to a human reviewer. |
| CI fails on `verify-ui` | The workflow cannot reach `DESIGNGATE_TARGET`, or verification failed. | Review the artifact report; configure a safely reachable preview URL; correct exact required failures. |
| Agent instructions look stale | The project has an older manifest or a modified managed block. | Rerun `init` with the desired adapter/preset, then inspect the managed sections and manifest hashes. |

## npm release procedure

The repository is prepared for a public npm package, but publishing requires an npm account authorized to publish the package name. Do not treat a local `pnpm pack` success as evidence that `npx designgate@latest` is available to the public.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
npm pack --dry-run --json --ignore-scripts
```

Review the dry-run file list. It must contain the CLI, rule files, package metadata, README, and license; it must not contain the dashboard source tree, development logs, browser captures, credentials, or temporary files.

Then use an authorized npm account:

```bash
npm login
npm publish --access public
npm view designgate version
```

If the unscoped package name is unavailable, change the package name to a scoped namespace such as `@your-org/designgate`, update documentation and release tests, then publish with `npm publish --access public`. Test the installed artifact in a clean directory after publication:

```bash
mkdir /tmp/designgate-clean && cd /tmp/designgate-clean
npx designgate@latest init . --preset react
npx designgate@latest rules .
```

## GitHub Actions and branch protection

`init` creates `.github/workflows/designgate.yml`. The `verify-ui` job installs Chromium and DesignGate, renders a target only when the repository variable `DESIGNGATE_TARGET` is populated, runs verification, and uploads `.designgate/` as an artifact.

The public `main` branch is protected with pull requests, one approving review, dismissal of stale approvals, resolved conversations, linear history, the `verify-ui` status check, administrator enforcement, and protection against force pushes and deletion. Apply the same policy to a fork or downstream repository in GitHub **Settings → Branches**.

The repository includes an administrator helper:

```bash
GITHUB_TOKEN=ghp_... npm run github:protect
```

The token must have repository-administration permission. If an automation credential lacks that permission, apply the policy manually in GitHub Settings or use a token created by a repository administrator with the correct permission.

Never commit personal access tokens, npm tokens, or other credentials to the repository, documentation, screenshots, test fixtures, issue comments, or shell history.

## Documentation link and repository validation

Run the following before a documentation checkpoint or release.

```bash
git diff --check
pnpm check
pnpm test
pnpm build
pnpm validate:docs
git status --short
```

For Markdown links, verify that all repository-relative destinations exist:

```bash
grep -RhoE '\]\([A-Za-z0-9_./-]+\.md\)' README.md docs SKILL.md | sort -u
```

Then inspect the branch relationship and synchronize only the intended commits:

```bash
git fetch origin
git status -sb
git log --oneline origin/main..HEAD
gh pr create --base main --fill
git status -sb
```

## Repository rename and migration

The canonical repository is now **[HosnainRafi/designgate](https://github.com/HosnainRafi/designgate)**. GitHub redirects the former `HosnainRafi/AI-fine-graded` URL, but contributors, automation, skill-install commands, package metadata, workflow badges, and documentation should use the new canonical URL to avoid depending on that redirect.

Existing local clones should update their remote once:

```bash
git remote set-url origin https://github.com/HosnainRafi/designgate.git
git remote -v
```

The rename preserves Git history, issues, pull requests, branch protection, and redirects from the previous GitHub URL. It does not publish the npm package: the package remains named `designgate`, and its public-registry status must be checked independently with `npm view designgate version` before advertising a live npm version.

## Incident boundaries

If a release, worker, evidence store, or database state is uncertain, stop automated retry loops. Preserve sanitized metadata and report versions, revoke or rotate exposed secrets, determine the scope of affected evidence, and recover using the project’s checkpoint/version history or a tested backup procedure. Do not overwrite evidence or delete run records before the incident has been investigated.

For general usage, read [DesignGate Product Guide](GUIDE.md). For AutoClaw Desktop, read [AutoClaw Desktop Integration](AUTOCLAW_DESKTOP.md). For the architecture roadmap, read [Scaling Roadmap](SCALING.md).
