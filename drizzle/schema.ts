import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  createdByUserId: int("createdByUserId").notNull(),
  plan: mysqlEnum("plan", ["starter"]).notNull().default("starter"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workspaceMembers = mysqlTable("workspace_members", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "reviewer", "member"]).notNull().default("member"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("workspace_member_unique").on(table.workspaceId, table.userId), index("workspace_member_user_idx").on(table.userId)]);

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  retentionDays: int("retentionDays").notNull().default(30),
  monthlyRunQuota: int("monthlyRunQuota").notNull().default(25),
  isArchived: int("isArchived").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("project_workspace_slug_unique").on(table.workspaceId, table.slug), index("project_workspace_idx").on(table.workspaceId)]);

export const projectMembers = mysqlTable("project_members", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "reviewer", "member"]).notNull().default("member"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("project_member_unique").on(table.projectId, table.userId), index("project_member_user_idx").on(table.userId)]);

export const rubricConfigs = mysqlTable("rubric_configs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId"),
  projectId: int("projectId"),
  createdByUserId: int("createdByUserId"),
  name: varchar("name", { length: 160 }).notNull().default("Default rubric"),
  configFileName: varchar("configFileName", { length: 64 }).notNull().default("designgate.config.json"),
  config: text("config").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("rubric_project_idx").on(table.projectId)]);

export const runs = mysqlTable("runs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId"),
  projectId: int("projectId"),
  createdByUserId: int("createdByUserId"),
  target: text("target").notNull(),
  generatorCommand: text("generatorCommand"),
  maxIterations: int("maxIterations").notNull().default(5),
  threshold: int("threshold").notNull().default(350),
  status: mysqlEnum("status", ["queued", "running", "passed", "failed", "canceled"]).notNull().default("queued"),
  overallScore: int("overallScore").notNull().default(0),
  currentIteration: int("currentIteration").notNull().default(0),
  rubricConfigId: int("rubricConfigId"),
  goalMode: text("goalMode"),
  extensions: text("extensions"),
  latestCritique: text("latestCritique"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("run_project_created_idx").on(table.projectId, table.createdAt), index("run_workspace_created_idx").on(table.workspaceId, table.createdAt)]);

export const runIterations = mysqlTable("run_iterations", {
  id: int("id").autoincrement().primaryKey(),
  runId: int("runId").notNull(),
  iteration: int("iteration").notNull(),
  overallScore: int("overallScore").notNull().default(0),
  passed: int("passed").notNull().default(0),
  tierA: text("tierA").notNull(),
  tierB: text("tierB").notNull(),
  critique: text("critique"),
  screenshots: text("screenshots").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("run_iteration_run_idx").on(table.runId, table.iteration)]);

export const verificationJobs = mysqlTable("verification_jobs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  projectId: int("projectId").notNull(),
  runId: int("runId"),
  requestedByUserId: int("requestedByUserId").notNull(),
  type: mysqlEnum("type", ["verification", "retention_cleanup"]).notNull().default("verification"),
  status: mysqlEnum("status", ["queued", "running", "completed", "failed", "canceled"]).notNull().default("queued"),
  requestPayload: text("requestPayload").notNull(),
  progressPercent: int("progressPercent").notNull().default(0),
  error: text("error"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("verification_job_project_status_idx").on(table.projectId, table.status), index("verification_job_run_idx").on(table.runId)]);

export const runReviews = mysqlTable("run_reviews", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  projectId: int("projectId").notNull(),
  runId: int("runId").notNull(),
  reviewerUserId: int("reviewerUserId").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "changes_requested"]).notNull().default("pending"),
  note: text("note"),
  decidedAt: timestamp("decidedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("run_reviewer_unique").on(table.runId, table.reviewerUserId), index("run_review_project_status_idx").on(table.projectId, table.status)]);

export const auditEvents = mysqlTable("audit_events", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  projectId: int("projectId"),
  actorUserId: int("actorUserId").notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  resourceType: varchar("resourceType", { length: 80 }).notNull(),
  resourceId: varchar("resourceId", { length: 80 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("audit_event_project_created_idx").on(table.projectId, table.createdAt), index("audit_event_workspace_created_idx").on(table.workspaceId, table.createdAt)]);

export const quotaUsage = mysqlTable("quota_usage", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  projectId: int("projectId").notNull(),
  periodKey: varchar("periodKey", { length: 7 }).notNull(),
  verificationRuns: int("verificationRuns").notNull().default(0),
  manualCleanups: int("manualCleanups").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("quota_usage_period_unique").on(table.projectId, table.periodKey), index("quota_usage_workspace_period_idx").on(table.workspaceId, table.periodKey)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type RubricConfig = typeof rubricConfigs.$inferSelect;
export type Run = typeof runs.$inferSelect;
export type RunIteration = typeof runIterations.$inferSelect;
export type VerificationJob = typeof verificationJobs.$inferSelect;
export type RunReview = typeof runReviews.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type QuotaUsage = typeof quotaUsage.$inferSelect;
