import { afterEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cli = join(process.cwd(), "cli/designgate.mjs");
const manifest = JSON.parse(readFileSync(join(process.cwd(), "rules/manifest.json"), "utf8"));
const created: string[] = [];

afterEach(() => { for (const path of created.splice(0)) rmSync(path, { recursive: true, force: true }); });

describe("installable DesignGate CLI", () => {
  it("initializes config, manifest, every supported adapter, and real payload hashes", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-cli-")); created.push(root);
    execFileSync(process.execPath, [cli, "init", root, "--agent", "cursor"], { encoding: "utf8" });
    const installed = JSON.parse(readFileSync(join(root, ".designgate/manifest.json"), "utf8"));
    expect(existsSync(join(root, "designgate.config.json"))).toBe(true);
    expect(existsSync(join(root, ".designgate/agents/claude-code.md"))).toBe(true);
    expect(readFileSync(join(root, ".designgate/agents/cursor.md"), "utf8")).toContain("DG-MOTION-001");
    for (const rule of installed.rules) expect(rule.hash).toBe(`sha256:${createHash("sha256").update(JSON.stringify(rule.payload)).digest("hex")}`);
  });

  it("reports concrete token, motion, responsive, changed-file, and agent evidence", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-verify-")); created.push(root);
    mkdirSync(join(root, "src/components"), { recursive: true });
    writeFileSync(join(root, "src/components/App.css"), "font-family: Avenir; --background:#111; display:grid; gap-4; transition:opacity; @media (min-width:768px){} prefers-reduced-motion focus-visible aria-label;");
    execFileSync(process.execPath, [cli, "init", root], { encoding: "utf8" });
    try { execFileSync(process.execPath, [cli, "verify", root], { encoding: "utf8" }); } catch { /* expected if a required rule remains absent */ }
    const report = JSON.parse(readFileSync(join(root, ".designgate/report.json"), "utf8"));
    expect(report.schemaVersion).toBe("1.1.0");
    expect(report.checks.every((check: { payloadHashValid: boolean; agentOutputPresent: boolean; agentOutputMatching: boolean; changedFiles: string[]; classifiedChanges: Record<string, string[]> }) => check.payloadHashValid && check.agentOutputPresent && check.agentOutputMatching && Array.isArray(check.changedFiles) && check.classifiedChanges["styles"]?.length)).toBe(true);
    expect(report.checks.find((check: { id: string }) => check.id === "DG-MOTION-001").evidence).toContain("motion");
    expect(typeof report.score).toBe("number");
  });

  it("emits concise exact feedback in compatibility loop mode", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-loop-")); created.push(root);
    execFileSync(process.execPath, [cli, "init", root, "--agent", "generic"], { encoding: "utf8" });
    writeFileSync(join(root, "generator.mjs"), "import { writeFileSync } from 'node:fs'; writeFileSync('agent-feedback.txt', process.argv.slice(2).join(' '));");
    try { execFileSync(process.execPath, [cli, "loop", root, "--generator", `${process.execPath} generator.mjs`, "--max-iterations", "1"], { encoding: "utf8" }); } catch { /* expected when the target is not yet compliant */ }
    expect(existsSync(join(root, "agent-feedback.txt"))).toBe(true);
    expect(readFileSync(join(root, "agent-feedback.txt"), "utf8")).toContain("DesignGate exact feedback:");
  });
});
