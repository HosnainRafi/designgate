import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("framework preset CLI contract", () => {
  it.each(["react", "nextjs", "vue", "component-library"])("installs the %s preset into a clean project", (preset) => {
    const project = mkdtempSync(join(tmpdir(), "designgate-preset-"));
    try {
      execFileSync("node", ["cli/designgate.mjs", "init", project, "--agent", "generic", "--preset", preset], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      const manifest = JSON.parse(readFileSync(join(project, ".designgate", "manifest.json"), "utf8"));
      const instructions = readFileSync(join(project, "DESIGNGATE.md"), "utf8");
      expect(manifest.preset).toBe(preset);
      expect(manifest.presetRules.length).toBeGreaterThan(0);
      expect(manifest.presetHash).toMatch(/^sha256:/);
      expect(instructions).toContain("Preset:");
      expect(instructions).toContain(manifest.presetRules[0].id);
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });
});
