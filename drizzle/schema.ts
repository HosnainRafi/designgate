import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

export const rubricConfigs = mysqlTable("rubric_configs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull().default("Default rubric"),
  configFileName: varchar("configFileName", { length: 64 }).notNull().default("designgate.config.json"),
  config: text("config").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const runs = mysqlTable("runs", {
  id: int("id").autoincrement().primaryKey(),
  target: text("target").notNull(),
  generatorCommand: text("generatorCommand"),
  maxIterations: int("maxIterations").notNull().default(5),
  threshold: int("threshold").notNull().default(350),
  status: mysqlEnum("status", ["queued", "running", "passed", "failed"]).notNull().default("queued"),
  overallScore: int("overallScore").notNull().default(0),
  currentIteration: int("currentIteration").notNull().default(0),
  rubricConfigId: int("rubricConfigId"),
  goalMode: text("goalMode"),
  extensions: text("extensions"),
  latestCritique: text("latestCritique"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

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
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type RubricConfig = typeof rubricConfigs.$inferSelect;
export type Run = typeof runs.$inferSelect;
export type RunIteration = typeof runIterations.$inferSelect;
