import { describe, expect, it } from "vitest";
import { currentPeriodKey, PROJECT_ROLES, startOfCurrentMonth } from "./db";
import { appRouter, roleAllows, USER_TRIGGERED_EXECUTION_POLICY } from "./routers";

describe("no-cost team readiness contracts", () => {
  it("uses the exact workspace role hierarchy", () => {
    expect(PROJECT_ROLES).toEqual(["owner", "admin", "reviewer", "member"]);
    expect(roleAllows("owner", ["admin"])).toBe(true);
    expect(roleAllows("admin", ["reviewer"])).toBe(true);
    expect(roleAllows("reviewer", ["member"])).toBe(true);
    expect(roleAllows("member", ["reviewer"])).toBe(false);
  });

  it("documents a bounded, user-triggered execution policy with manual cleanup", () => {
    expect(USER_TRIGGERED_EXECUTION_POLICY).toEqual({ backgroundWorker: false, maximumActiveJobsPerProject: 2, retentionCleanup: "manual" });
  });

  it("derives stable UTC quota periods", () => {
    const date = new Date("2026-08-16T18:30:00.000Z");
    expect(currentPeriodKey(date)).toBe("2026-08");
    expect(startOfCurrentMonth(date).toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  it("rejects anonymous access to project-scoped operations before touching project data", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
    await expect(caller.runs.list({ projectId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.governance.summary({ projectId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
