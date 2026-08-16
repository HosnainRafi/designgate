import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, rubricConfigs, runIterations, runs, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

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

export async function listRuns() { const db = await getDb(); return db ? db.select().from(runs).orderBy(desc(runs.createdAt)) : []; }
export async function getRun(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(runs).where(eq(runs.id, id)).limit(1); return rows[0]; }
export async function getIterations(runId: number) { const db = await getDb(); return db ? db.select().from(runIterations).where(eq(runIterations.runId, runId)).orderBy(runIterations.iteration) : []; }
export async function getIteration(runId: number, iteration: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(runIterations).where(and(eq(runIterations.runId, runId), eq(runIterations.iteration, iteration))).limit(1); return rows[0]; }
export async function insertRun(input: typeof runs.$inferInsert) { const db = await getDb(); if (!db) return undefined; const result = await db.insert(runs).values(input); return Number(result[0].insertId); }
export async function insertIteration(input: typeof runIterations.$inferInsert) { const db = await getDb(); if (!db) return undefined; await db.insert(runIterations).values(input); }
export async function updateIterationScreenshots(runId: number, iteration: number, screenshots: string) { const db = await getDb(); if (!db) return; await db.update(runIterations).set({ screenshots }).where(and(eq(runIterations.runId, runId), eq(runIterations.iteration, iteration))); }
export async function updateRun(id: number, input: Partial<typeof runs.$inferInsert>) { const db = await getDb(); if (!db) return; await db.update(runs).set(input).where(eq(runs.id, id)); }
export async function listRubrics() { const db = await getDb(); return db ? db.select().from(rubricConfigs).orderBy(desc(rubricConfigs.updatedAt)) : []; }
export async function getRubric(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(rubricConfigs).where(eq(rubricConfigs.id, id)).limit(1); return rows[0]; }
export async function saveRubric(input: typeof rubricConfigs.$inferInsert) { const db = await getDb(); if (!db) return undefined; if (input.id) { await db.update(rubricConfigs).set(input).where(eq(rubricConfigs.id, input.id)); return input.id; } const result = await db.insert(rubricConfigs).values(input); return Number(result[0].insertId); }
