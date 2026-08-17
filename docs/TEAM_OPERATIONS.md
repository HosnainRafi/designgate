# No-Cost Team Operations

DesignGate’s hosted workspace now provides a **no-new-service-cost control plane** for small teams. It uses the application’s existing sign-in, database, and storage integration. Verification work is initiated by a signed-in person, performed in the request that person starts, and durably recorded afterward. The model deliberately avoids an always-on queue consumer, an additional browser-hosting service, and a required vision-model API key.

> The no-cost model is a governance and review layer, not a substitute for dedicated browser-worker infrastructure. It is appropriate when bounded, interactive verification is acceptable; the CLI remains the most portable execution surface.

## What is included

| Capability | Current behavior | Cost or credential requirement |
| --- | --- | --- |
| Workspace isolation | The first authenticated visit creates a private workspace and default project. Every run, rubric, job, review, audit event, and policy is project-scoped. | Uses the existing database and sign-in. |
| Roles | `owner`, `admin`, `reviewer`, and `member` are enforced by server-side project checks. Workspace owners and admins inherit project access. | No new key. |
| User-triggered jobs | A verification action records a queued/running/completed job and executes immediately. Each project is bounded to two active jobs. | No persistent worker. |
| Human review | Reviewers, admins, and owners can approve a run or request changes with a note. | No new key. |
| Audit trail | Membership, project settings, run jobs, review decisions, manual cleanup, and quota-sensitive actions generate project audit events. | Uses the existing database. |
| Retention | A project has a configurable retention window. Expired runs are removed only through an explicit, audited manual cleanup. | No scheduler. |
| Quotas | A configurable monthly run allowance is checked before a run starts and shown in the dashboard. | No billing system or API key. |

## Operating model

Open **Team operations** from the dashboard navigation. Select the active project, set a monthly run quota and retention window, then use **Overview** to start verification. The operation creates a project-scoped job, checks the current monthly allowance, records its state transitions, and writes an audit event. It does not leave a process running when the request ends.

After a run has finished, a reviewer can enter its run ID in **Human quality decisions** and record either **Approve run** or **Request changes**. The decision is persisted with the reviewer identity and optional note. The dashboard also shows recent job records, member roles, quota usage, and audit history.

Retention cleanup is intentionally manual. When the dashboard identifies runs older than the configured policy, an owner or admin may choose **Run manual retention cleanup** and confirm the destructive action. The system then records one cleanup job and one audit event. This makes deletion visible and avoids hidden background work.

## Role boundary

| Role | Create runs | Review runs | Manage memberships and projects | Change quota or retention | Cleanup expired runs |
| --- | --- | --- | --- | --- | --- |
| Owner | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Yes |
| Reviewer | Yes | Yes | No | No | No |
| Member | Yes | No | No | No | No |

Direct membership is server-enforced through the project membership procedure. The first release surfaces real current membership in the dashboard but intentionally does not include an email invitation workflow, which would require email delivery and account-discovery controls beyond the no-cost scope.

## Deliberate constraints

The no-cost model does **not** run scheduled cleanup, poll a queue, regrade evidence on a timer, or conceal a vision request behind a platform-owned credential. Tier A checks can operate locally; Tier B remains opt-in and requires the team’s own configured provider key when used. If a request fails or the hosting environment stops it, the job record keeps the failure state for inspection and retry through a new explicit request.

For large teams, long-running renders, high concurrency, scheduled retention, or isolated browser execution, use the durable worker architecture described in the [Scaling Roadmap](SCALING.md#worker-queue-and-concurrency). That later model needs a deliberate hosting and budget decision; it is not silently enabled by this dashboard.

## Release validation

The readiness layer is validated with an additive migration, server authorization and policy tests, TypeScript compilation, the existing application test suite, and desktop/mobile dashboard checks. The relevant contract tests assert the role hierarchy, anonymous access rejection, UTC quota-period calculation, and the explicit policy that background workers are disabled.
