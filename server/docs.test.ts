import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("DesignGate documentation and OpenClaw skill contract", () => {
  it("ships the complete documentation set linked by the README", () => {
    const required = ["docs/GUIDE.md", "docs/AUTOCLAW_DESKTOP.md", "docs/SCALING.md", "docs/OPERATIONS.md", "docs/TEAM_OPERATIONS.md", "docs/research-sources.md", "SKILL.md"];
    for (const path of required) expect(existsSync(join(root, path))).toBe(true);
    const readme = read("README.md");
    for (const path of required.slice(0, -1)) expect(readme).toContain(path);
  });

  it("documents required evidence, grading dimensions, and exact feedback policy", () => {
    const guide = read("docs/GUIDE.md");
    for (const value of ["Tier A", "Tier B", "variance", "motion", "density", "assetDependence", "brandFidelity", "designgate.config.json", "390 × 844", "834 × 1112", "1440 × 1000", "verbatim"]) expect(guide).toContain(value);
    expect(guide).toContain("runs/<runId>/iteration-<iteration>/");
    for (const value of ["loop --grade", "ANTHROPIC_API_KEY", "claude-sonnet-4-6", "DESIGNGATE_ANTHROPIC_MODEL", "project-context.json", "schemaVersion: \"1.3.0\"", "DG-3D-001", "DG-3D-002", "DG-DEPTH-001", "DG-INTERACT-001", "DG-PERF-001", "immersiveness", "designgate@latest plan", "designgate@latest build", "gaming", "portfolio", "ecommerce"]) expect(guide).toContain(value);
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
    expect(autoclaw).toContain("gaming-3d");
    expect(autoclaw).toContain("designgate plan");
    expect(autoclaw).toContain("designgate@latest build");
  });

  it("documents the no-cost team operations boundary without promising an always-on worker", () => {
    const operations = read("docs/TEAM_OPERATIONS.md");
    for (const value of ["workspace", "owner", "reviewer", "audit", "retention", "quota", "User-triggered", "No persistent worker", "manual cleanup"]) expect(operations).toContain(value);
    expect(read("docs/SCALING.md")).toContain("Current no-cost control plane");
  });
});
