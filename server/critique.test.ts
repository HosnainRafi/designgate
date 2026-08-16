import { describe, expect, it } from "vitest";
import { makeCritique } from "./routers";

describe("DesignGate critique formatter", () => {
  it("preserves exact fix and low-score instruction strings", () => {
    const result = makeCritique(
      [{ id: "spacing", pass: false, detail: "Card grid uses two inconsistent vertical gaps between sections.", severity: "warning" }],
      { motion: { score: 1, note: "No meaningful transition explains the state change.", weight: 0.15 } },
      2,
    );
    expect(result).toBe("The following specific issues were found in the last version. Fix these exactly, do not redesign unrelated parts:\nFix: Card grid uses two inconsistent vertical gaps between sections.\nImprove motion: No meaningful transition explains the state change.");
  });
});
