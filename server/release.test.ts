import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("release operations contract", () => {
  it("declares public npm metadata and release checks", () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    expect(packageJson.publishConfig.access).toBe("public");
    expect(packageJson.repository.url).toContain("AI-fine-graded");
    expect(packageJson.scripts["release:check"]).toContain("release:pack-json");
    expect(packageJson.scripts["release:pack-json"]).toContain("npm pack --dry-run --json --ignore-scripts");
    expect(packageJson.scripts["github:protect"]).toContain("scripts/protect-main.mjs");
  });

  it("ships all framework presets and the required pull-request workflow", () => {
    for (const preset of ["react", "nextjs", "vue", "component-library"]) {
      expect(existsSync(join(process.cwd(), "rules", "presets", `${preset}.json`))).toBe(true);
    }
    expect(existsSync(join(process.cwd(), "scripts/protect-main.mjs"))).toBe(true);
    const workflow = readFileSync(join(process.cwd(), ".github/workflows/designgate.yml"), "utf8");
    expect(workflow).toContain("name: verify-ui");
    const pnpmSetupStart = workflow.indexOf("uses: pnpm/action-setup@v4");
    const nodeSetupStart = workflow.indexOf("uses: actions/setup-node@v4");
    expect(pnpmSetupStart).toBeLessThan(nodeSetupStart);
    expect(workflow.slice(pnpmSetupStart, nodeSetupStart)).not.toContain("version:");
    expect(workflow).toContain("node cli/designgate.mjs verify .");
  });
});
