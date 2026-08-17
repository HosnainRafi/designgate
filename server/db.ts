import { and, desc, eq, gte, lt, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditEvents,
  InsertUser,
  projectMembers,
  projects,
  quotaUsage,
  rubricConfigs,
  runIterations,
  runReviews,
  runs,
  users,
  verificationJobs,
  workspaceMembers,
  workspaces,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

export const PROJECT_ROLES = ["owner", "admin", "reviewer", "member"] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn };
  if (user.role || user.openId === ENV.ownerOpenId) { values.role = user.role ?? "admin"; updateSet.role = values.role; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

function slugify(input: string) {
  const value = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 96);
  return value || "workspace";
}

export function currentPeriodKey(now = new Date()) { return now.toISOString().slice(0, 7); }
export function startOfCurrentMonth(now = new Date()) { return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); }

export async function bootstrapWorkspace(userId: number, displayName?: string | null) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select({ workspace: workspaces, membership: workspaceMembers })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(workspaces.createdAt)
    .limit(1);
  if (existing[0]) return existing[0];

  const workspaceName = `${displayName?.trim() || "Personal"} workspace`;
  const workspaceResult = await db.insert(workspaces).values({
    name: workspaceName,
    slug: `personal-${userId}`,
    createdByUserId: userId,
    plan: "starter",
  });
  const workspaceId = Number(workspaceResult[0].insertId);
  await db.insert(workspaceMembers).values({ workspaceId, userId, role: "owner" });
  const projectResult = await db.insert(projects).values({ workspaceId, name: "Default project", slug: "default", createdByUserId: userId });
  const projectId = Number(projectResult[0].insertId);
  await db.insert(projectMembers).values({ projectId, userId, role: "owner" });
  await writeAuditEvent({ workspaceId, projectId, actorUserId: userId, action: "workspace.bootstrapped", resourceType: "workspace", resourceId: String(workspaceId), metadata: { projectId } });
  const created = await db.select({ workspace: workspaces, membership: workspaceMembers })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .limit(1);
  return created[0] ?? null;
}

export async function getWorkspaceForUser(userId: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select({ workspace: workspaces, membership: workspaceMembers })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(workspaces.createdAt)
    .limit(1);
  return result[0] ?? null;
}

export async function listProjectsForWorkspace(workspaceId: number, userId: number) {
  const db = await getDb(); if (!db) return [];
  const scoped = await db.select({ project: projects, membership: projectMembers })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(and(eq(projectMembers.userId, userId), eq(projects.workspaceId, workspaceId), eq(projects.isArchived, 0)))
    .orderBy(projects.createdAt);
  const workspaceMembership = await db.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId))).limit(1);
  if (workspaceMembership[0] && ["owner", "admin"].includes(workspaceMembership[0].role)) {
    const allProjects = await db.select().from(projects).where(and(eq(projects.workspaceId, workspaceId), eq(projects.isArchived, 0))).orderBy(projects.createdAt);
    return allProjects.map(project => ({ project, membership: scoped.find(item => item.project.id === project.id)?.membership ?? { role: workspaceMembership[0].role, projectId: project.id, userId } }));
  }
  return scoped;
}

export async function createProject(input: { workspaceId: number; userId: number; name: string; retentionDays?: number; monthlyRunQuota?: number }) {
  const db = await getDb(); if (!db) return undefined;
  const base = slugify(input.name);
  const slug = `${base}-${Date.now().toString(36).slice(-5)}`;
  const result = await db.insert(projects).values({ workspaceId: input.workspaceId, name: input.name.trim(), slug, createdByUserId: input.userId, retentionDays: input.retentionDays ?? 30, monthlyRunQuota: input.monthlyRunQuota ?? 25 });
  const id = Number(result[0].insertId);
  await db.insert(projectMembers).values({ projectId: id, userId: input.userId, role: "owner" });
  await writeAuditEvent({ workspaceId: input.workspaceId, projectId: id, actorUserId: input.userId, action: "project.created", resourceType: "project", resourceId: String(id), metadata: { name: input.name.trim() } });
  return id;
}

export async function getProject(projectId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1); return rows[0]; }

export async function getProjectAccess(userId: number, projectId: number) {
  const db = await getDb(); if (!db) return null;
  const project = await getProject(projectId); if (!project) return null;
  const direct = await db.select().from(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))).limit(1);
  if (direct[0]) return { project, role: direct[0].role as ProjectRole, source: "project" as const };
  const workspace = await db.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, project.workspaceId), eq(workspaceMembers.userId, userId))).limit(1);
  if (workspace[0] && ["owner", "admin"].includes(workspace[0].role)) return { project, role: workspace[0].role as ProjectRole, source: "workspace" as const };
  return null;
}

export async function updateProjectSettings(input: { projectId: number; retentionDays?: number; monthlyRunQuota?: number; isArchived?: number }) {
  const db = await getDb(); if (!db) return;
  await db.update(projects).set({ retentionDays: input.retentionDays, monthlyRunQuota: input.monthlyRunQuota, isArchived: input.isArchived }).where(eq(projects.id, input.projectId));
}

export async function listProjectMembers(projectId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({ membership: projectMembers, user: { id: users.id, name: users.name, email: users.email } })
    .from(projectMembers).innerJoin(users, eq(projectMembers.userId, users.id)).where(eq(projectMembers.projectId, projectId)).orderBy(projectMembers.createdAt);
}

export async function addProjectMember(input: { projectId: number; userId: number; role: ProjectRole }) {
  const db = await getDb(); if (!db) return;
  await db.insert(projectMembers).values(input).onDuplicateKeyUpdate({ set: { role: input.role } });
}

export async function writeAuditEvent(input: { workspaceId: number; projectId?: number | null; actorUserId: number; action: string; resourceType: string; resourceId?: string | null; metadata?: unknown }) {
  const db = await getDb(); if (!db) return;
  await db.insert(auditEvents).values({ ...input, projectId: input.projectId ?? null, resourceId: input.resourceId ?? null, metadata: input.metadata ? JSON.stringify(input.metadata) : null });
}

export async function listAuditEvents(projectId: number, limit = 40) {
  const db = await getDb(); if (!db) return [];
  return db.select({ event: auditEvents, actor: { id: users.id, name: users.name, email: users.email } })
    .from(auditEvents).innerJoin(users, eq(auditEvents.actorUserId, users.id)).where(eq(auditEvents.projectId, projectId)).orderBy(desc(auditEvents.createdAt)).limit(limit);
}

export async function getQuotaSummary(projectId: number) {
  const db = await getDb(); if (!db) return null;
  const project = await getProject(projectId); if (!project) return null;
  const periodKey = currentPeriodKey();
  const usage = await db.select().from(quotaUsage).where(and(eq(quotaUsage.projectId, projectId), eq(quotaUsage.periodKey, periodKey))).limit(1);
  return { project, periodKey, verificationRuns: usage[0]?.verificationRuns ?? 0, manualCleanups: usage[0]?.manualCleanups ?? 0, remainingRuns: Math.max(0, project.monthlyRunQuota - (usage[0]?.verificationRuns ?? 0)) };
}

export async function incrementQuota(input: { workspaceId: number; projectId: number; type: "verificationRuns" | "manualCleanups" }) {
  const db = await getDb(); if (!db) return;
  const periodKey = currentPeriodKey();
  const column = input.type === "verificationRuns" ? quotaUsage.verificationRuns : quotaUsage.manualCleanups;
  await db.insert(quotaUsage).values({ workspaceId: input.workspaceId, projectId: input.projectId, periodKey, verificationRuns: input.type === "verificationRuns" ? 1 : 0, manualCleanups: input.type === "manualCleanups" ? 1 : 0 })
    .onDuplicateKeyUpdate({ set: { [input.type]: sql`${column} + 1` } });
}

export async function listRuns(projectId?: number) { const db = await getDb(); return db ? db.select().from(runs).where(projectId ? eq(runs.projectId, projectId) : undefined).orderBy(desc(runs.createdAt)) : []; }
export async function getRun(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(runs).where(eq(runs.id, id)).limit(1); return rows[0]; }
export async function getIterations(runId: number) { const db = await getDb(); return db ? db.select().from(runIterations).where(eq(runIterations.runId, runId)).orderBy(runIterations.iteration) : []; }
export async function getIteration(runId: number, iteration: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(runIterations).where(and(eq(runIterations.runId, runId), eq(runIterations.iteration, iteration))).limit(1); return rows[0]; }
export async function insertRun(input: typeof runs.$inferInsert) { const db = await getDb(); if (!db) return undefined; const result = await db.insert(runs).values(input); return Number(result[0].insertId); }
export async function insertIteration(input: typeof runIterations.$inferInsert) { const db = await getDb(); if (!db) return; await db.insert(runIterations).values(input); }
export async function updateIterationScreenshots(runId: number, iteration: number, screenshots: string) { const db = await getDb(); if (!db) return; await db.update(runIterations).set({ screenshots }).where(and(eq(runIterations.runId, runId), eq(runIterations.iteration, iteration))); }
export async function updateRun(id: number, input: Partial<typeof runs.$inferInsert>) { const db = await getDb(); if (!db) return; await db.update(runs).set(input).where(eq(runs.id, id)); }

export async function listRubrics(projectId?: number) { const db = await getDb(); return db ? db.select().from(rubricConfigs).where(projectId ? eq(rubricConfigs.projectId, projectId) : undefined).orderBy(desc(rubricConfigs.updatedAt)) : []; }
export async function getRubric(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(rubricConfigs).where(eq(rubricConfigs.id, id)).limit(1); return rows[0]; }
export async function saveRubric(input: typeof rubricConfigs.$inferInsert) { const db = await getDb(); if (!db) return undefined; if (input.id) { await db.update(rubricConfigs).set(input).where(eq(rubricConfigs.id, input.id)); return input.id; } const result = await db.insert(rubricConfigs).values(input); return Number(result[0].insertId); }

export async function createVerificationJob(input: typeof verificationJobs.$inferInsert) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.insert(verificationJobs).values(input); return Number(result[0].insertId);
}
export async function getJob(jobId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(verificationJobs).where(eq(verificationJobs.id, jobId)).limit(1); return rows[0]; }
export async function listJobs(projectId: number) { const db = await getDb(); return db ? db.select().from(verificationJobs).where(eq(verificationJobs.projectId, projectId)).orderBy(desc(verificationJobs.createdAt)).limit(40) : []; }
export async function updateJob(id: number, input: Partial<typeof verificationJobs.$inferInsert>) { const db = await getDb(); if (!db) return; await db.update(verificationJobs).set(input).where(eq(verificationJobs.id, id)); }

export async function listReviews(projectId: number) { const db = await getDb(); return db ? db.select().from(runReviews).where(eq(runReviews.projectId, projectId)).orderBy(desc(runReviews.updatedAt)).limit(40) : []; }
export async function getReviewForRun(runId: number, reviewerUserId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(runReviews).where(and(eq(runReviews.runId, runId), eq(runReviews.reviewerUserId, reviewerUserId))).limit(1); return rows[0]; }
export async function saveReview(input: typeof runReviews.$inferInsert) { const db = await getDb(); if (!db) return undefined; const existing = await getReviewForRun(input.runId, input.reviewerUserId); if (existing) { await db.update(runReviews).set(input).where(eq(runReviews.id, existing.id)); return existing.id; } const result = await db.insert(runReviews).values(input); return Number(result[0].insertId); }

export async function countRetentionEligibleRuns(projectId: number, retentionDays: number) {
  const db = await getDb(); if (!db) return 0;
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const rows = await db.select({ id: runs.id }).from(runs).where(and(eq(runs.projectId, projectId), lt(runs.updatedAt, cutoff)));
  return rows.length;
}
export async function cleanupRetentionEligibleRuns(projectId: number, retentionDays: number) {
  const db = await getDb(); if (!db) return 0;
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const expired = await db.select({ id: runs.id }).from(runs).where(and(eq(runs.projectId, projectId), lt(runs.updatedAt, cutoff)));
  if (!expired.length) return 0;
  const runIds = expired.map(row => row.id);
  await db.delete(runIterations).where(or(...runIds.map(id => eq(runIterations.runId, id))));
  await db.delete(runReviews).where(or(...runIds.map(id => eq(runReviews.runId, id))));
  await db.delete(runs).where(or(...runIds.map(id => eq(runs.id, id))));
  return runIds.length;
}
