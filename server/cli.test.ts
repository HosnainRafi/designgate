import { afterEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cli = join(process.cwd(), "cli/designgate.mjs");
const created: string[] = [];
const run = (args: string[]) => execFileSync(process.execPath, [cli, ...args], { encoding: "utf8" });
afterEach(() => { for (const path of created.splice(0)) rmSync(path, { recursive: true, force: true }); });

describe("installable DesignGate CLI", () => {
  it("declares a minimal publishable npm package contract", () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    expect(packageJson.bin.designgate).toBe("cli/designgate.mjs");
    expect(packageJson.files).toEqual(expect.arrayContaining(["cli", "rules", "docs", "README.md", "LICENSE", "SKILL.md"]));
    expect(packageJson.publishConfig.access).toBe("public");
    for (const file of ["README.md", "LICENSE", "SKILL.md", "docs/GUIDE.md", "cli/designgate.mjs", "rules/manifest.json"]) expect(existsSync(join(process.cwd(), file))).toBe(true);
  });

  it("includes the expected files in the actual npm dry-run tarball", () => {
    const output = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: process.cwd(), encoding: "utf8" });
    const packed = JSON.parse(output)[0];
    const files = packed.files.map((file: { path: string }) => file.path);
    expect(files).toEqual(expect.arrayContaining(["LICENSE", "README.md", "SKILL.md", "docs/GUIDE.md", "docs/AUTOCLAW_DESKTOP.md", "docs/SCALING.md", "docs/OPERATIONS.md", "cli/designgate.mjs", "package.json", "rules/manifest.json", "rules/designgate-modern-ui.md"]));
    expect(files.some((file: string) => file.startsWith("client/") || file.startsWith("server/"))).toBe(false);
  });

  it("initializes native agent instructions, a CI workflow, and real payload hashes", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-cli-")); created.push(root);
    run(["init", root, "--agent", "cursor"]);
    const installed = JSON.parse(readFileSync(join(root, ".designgate/manifest.json"), "utf8"));
    expect(existsSync(join(root, "designgate.config.json"))).toBe(true);
    expect(existsSync(join(root, "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(root, ".cursor/rules/designgate.mdc"))).toBe(true);
    expect(existsSync(join(root, ".github/workflows/designgate.yml"))).toBe(true);
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toContain("DG-MOTION-001");
    for (const rule of installed.rules) expect(rule.hash).toBe(`sha256:${createHash("sha256").update(JSON.stringify(rule.payload)).digest("hex")}`);
  });

  it("captures real mobile, tablet, and desktop Playwright evidence", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-render-")); created.push(root);
    const html = join(root, "index.html");
    writeFileSync(html, "<style>@media (max-width:700px){body{padding:1rem}}@media (prefers-reduced-motion:reduce){*{transition:none}}body{font-family:Arial;display:grid;gap:1rem}</style><button aria-label='quality'>Render</button>");
    run(["init", root]);
    const response = JSON.parse(run(["render", html, "--project", root]));
    expect(response.engine).toBe("playwright-chromium");
    expect(response.captures.map((capture: { breakpoint: string }) => capture.breakpoint)).toEqual(["mobile", "tablet", "desktop"]);
    for (const capture of response.captures) expect(existsSync(join(root, capture.path))).toBe(true);
    expect(existsSync(join(root, ".designgate/latest-capture.json"))).toBe(true);
    const payload = JSON.parse(run(["evidence", root, "--run-id", "11", "--iteration", "1"]));
    expect(payload.runId).toBe(11);
    expect(payload.captureManifest.captures.map((capture: { breakpoint: string }) => capture.breakpoint)).toEqual(["mobile", "tablet", "desktop"]);
    expect(payload.captureManifest.captures.every((capture: { base64: string; mimeType: string }) => capture.mimeType === "image/png" && capture.base64.length > 100)).toBe(true);
  });

  it("reports concrete token, motion, responsive, changed-file, and agent evidence", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-verify-")); created.push(root);
    mkdirSync(join(root, "src/components"), { recursive: true });
    writeFileSync(join(root, "src/components/App.css"), "font-family: Avenir; --background:#111; display:grid; gap-4; transition:opacity; @media (min-width:768px){} prefers-reduced-motion focus-visible aria-label;");
    run(["init", root]);
    try { run(["verify", root]); } catch { /* expected if a required rule remains absent */ }
    const report = JSON.parse(readFileSync(join(root, ".designgate/report.json"), "utf8"));
    expect(report.schemaVersion).toBe("1.2.0");
    expect(report.checks.every((check: { payloadHashValid: boolean; agentOutputMatching: boolean; changedFiles: string[]; classifiedChanges: Record<string, string[]> }) => check.payloadHashValid && check.agentOutputMatching && Array.isArray(check.changedFiles) && check.classifiedChanges["styles"]?.length)).toBe(true);
    expect(report.checks.find((check: { id: string }) => check.id === "DG-MOTION-001").evidence).toContain("motion");
  });

  it("does not let Markdown documentation prose create a false color-rule failure", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-doc-prose-")); created.push(root);
    mkdirSync(join(root, "src/components"), { recursive: true });
    writeFileSync(join(root, "src/components/App.css"), "font-family:Avenir;--background:#111;display:grid;gap:1rem;transition:opacity;@media (min-width:768px){}@media (prefers-reduced-motion:reduce){}focus-visible aria-label;");
    writeFileSync(join(root, "README.md"), "Documentation may explain why a generic purple-to-pink treatment is prohibited.");
    writeFileSync(join(root, "src/components/ColorPolicy.test.ts"), "const explanation = 'purple-to-pink is prohibited in UI output';");
    mkdirSync(join(root, "cli"), { recursive: true });
    writeFileSync(join(root, "cli/implementation.mjs"), "const policy = 'purple-to-pink belongs only in a documentation example';");
    mkdirSync(join(root, "server"), { recursive: true });
    writeFileSync(join(root, "server/rubric.ts"), "export const policy = 'purple-to-pink is forbidden by the verifier';");
    run(["init", root]);
    writeFileSync(join(root, ".designgate/latest-capture.json"), JSON.stringify({ engine: "playwright-chromium", captures: [] }));
    try { run(["verify", root]); } catch { /* inspect the persisted report for the focused color-rule assertion */ }
    const report = JSON.parse(readFileSync(join(root, ".designgate/report.json"), "utf8"));
    expect(report.checks.find((check: { id: string; applied: boolean }) => check.id === "DG-COLOR-001").applied).toBe(true);
  });

  it("emits concise exact feedback in compatibility loop mode", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-loop-")); created.push(root);
    run(["init", root, "--agent", "generic"]);
    writeFileSync(join(root, "generator.mjs"), "import { writeFileSync } from 'node:fs'; writeFileSync('agent-feedback.txt', process.argv.slice(2).join(' '));");
    try { run(["loop", root, "--generator", `${process.execPath} generator.mjs`, "--max-iterations", "1"]); } catch { /* expected when the target is not yet compliant */ }
    expect(readFileSync(join(root, "agent-feedback.txt"), "utf8")).toContain("DesignGate exact feedback:");
  });
});
