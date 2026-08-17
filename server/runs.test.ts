import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("DesignGate backend contracts", () => {
  it("exposes the exact default rubric contract", async () => {
    const result = await appRouter.createCaller({ user: undefined, req: {} as any, res: {} as any }).defaults();
    expect(result.maxIterations).toBe(5);
    expect(result.threshold.overall).toBe(3.5);
    expect(result.tierB.dimensions.map(item => item.name)).toEqual(["variance", "motion", "density", "assetDependence", "brandFidelity"]);
    expect(Object.keys(result.tierA)).toEqual(["fonts", "gradients", "spacing", "contrast", "responsive", "icons"]);
  });

  it("keeps the report endpoint typed and rejects an inaccessible unknown run", async () => {
    const caller = appRouter.createCaller({ user: { id: 999 } as any, req: {} as any, res: {} as any });
    await expect(caller.runs.report({ id: 999999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
