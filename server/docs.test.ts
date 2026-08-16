import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("DesignGate documentation and OpenClaw skill contract", () => {
  it("ships the complete documentation set linked by the README", () => {
    const required = ["docs/GUIDE.md", "docs/AUTOCLAW_DESKTOP.md", "docs/SCALING.md", "docs/OPERATIONS.md", "docs/research-sources.md", "SKILL.md"];
    for (const path of required) expect(existsSync(join(root, path))).toBe(true);
    const readme = read("README.md");
    for (const path of required.slice(0, -1)) expect(readme).toContain(path);
  });

  it("documents required evidence, grading dimensions, and exact feedback policy", () => {
    const guide = read("docs/GUIDE.md");
    for (const value of ["Tier A", "Tier B", "variance", "motion", "density", "assetDependence", "brandFidelity", "designgate.config.json", "390 × 844", "834 × 1112", "1440 × 1000", "verbatim"]) expect(guide).toContain(value);
    expect(guide).toContain("runs/<runId>/iteration-<iteration>/");
    for (const value of ["loop --grade", "ANTHROPIC_API_KEY", "claude-sonnet-4-6", "DESIGNGATE_ANTHROPIC_MODEL", "project-context.json", "schemaVersion: \"1.3.0\""]) expect(guide).toContain(value);
  });

  it("provides an installable OpenClaw skill with a safe verification workflow", () => {
    const skill = read("SKILL.md");
    expect(skill).toContain("name: designgate");
    expect(skill).toContain("npx designgate@latest init");
    expect(skill).toContain("Tier B critique exactly as written");
    const autoclaw = read("docs/AUTOCLAW_DESKTOP.md");
    expect(autoclaw).toContain("openclaw skills install git:HosnainRafi/designgate@main --as designgate");
    expect(autoclaw).toContain("$designgate");
    expect(autoclaw).toContain("--grade");
    expect(autoclaw).toContain("ANTHROPIC_API_KEY");
  });
});
