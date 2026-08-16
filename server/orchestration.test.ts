import { describe, expect, it } from "vitest";
import { buildTierB, makeCritique, runTierAChecks } from "./routers";

describe("DesignGate orchestration", () => {
  it("produces all required Tier A checks and resolves the spacing issue after a retry", () => {
    const first = runTierAChecks("https://example.test", 1);
    const second = runTierAChecks("https://example.test", 2);
    expect(first.map(check => check.id)).toEqual(["fonts", "gradients", "spacing", "contrast", "responsive", "icons"]);
    expect(first.find(check => check.id === "spacing")?.pass).toBe(false);
    expect(second.find(check => check.id === "spacing")?.pass).toBe(true);
  });

  it("keeps the exact Tier B dimension vocabulary and computes a rising retry signal", () => {
    const first = buildTierB(1);
    const second = buildTierB(2);
    expect(Object.keys(first)).toEqual(["variance", "motion", "density", "assetDependence", "brandFidelity"]);
    expect(second.motion.score).toBeGreaterThan(first.motion.score);
    const firstScore = Object.values(first).reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0);
    const secondScore = Object.values(second).reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0);
    expect(secondScore).toBeGreaterThan(firstScore);
  });

  it("formats a failed deterministic check as the exact generator instruction", () => {
    const checks = runTierAChecks("https://example.test", 1);
    const critique = makeCritique(checks, buildTierB(1), 4);
    expect(critique).toContain("Fix: Spacing probe found inconsistent vertical gaps between card groups.");
    expect(critique).toContain("Improve motion: Primary controls expose transition opportunities for the next generator pass.");
  });
});
