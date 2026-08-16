import { afterEach, describe, expect, it } from "vitest";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cli = join(process.cwd(), "cli/designgate.mjs");
const created: string[] = [];
const run = (args: string[], env: NodeJS.ProcessEnv = process.env) => execFileSync(process.execPath, [cli, ...args], { encoding: "utf8", env });
afterEach(() => { for (const path of created.splice(0)) rmSync(path, { recursive: true, force: true }); });

async function startVisionServer(root: string) {
  const script = join(root, "vision-server.mjs");
  writeFileSync(script, `import { createServer } from "node:http";
const grade = { variance: { score: 1, note: "Increase hierarchy and distinctiveness." }, motion: { score: 1, note: "Add purposeful motion cues." }, density: { score: 1, note: "Improve grouping and whitespace." }, assetDependence: { score: 1, note: "Replace generic visual assets." }, brandFidelity: { score: 1, note: "Strengthen the shared brand language." }, immersiveness: { score: 1, note: "Make depth and spatial composition purposeful." } };
const server = createServer((request, response) => { let body = ""; request.on("data", chunk => body += chunk); request.on("end", () => { response.writeHead(200, { "content-type": "application/json" }); response.end(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(grade) }] })); }); });
server.listen(0, "127.0.0.1", () => console.log(server.address().port));`);
  const child = spawn(process.execPath, [script], { stdio: ["ignore", "pipe", "inherit"] });
  const port = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out starting mock vision server.")), 5000);
    child.once("error", reject);
    child.stdout.once("data", buffer => { clearTimeout(timeout); resolve(String(buffer).trim()); });
  });
  return { baseUrl: `http://127.0.0.1:${port}`, stop: () => child.kill() };
}

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

  it("detects reusable project context during initialization", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-context-")); created.push(root);
    mkdirSync(join(root, "src/components"), { recursive: true });
    writeFileSync(join(root, "src/components/Button.tsx"), "export function Button() { return <button>Save</button>; }");
    writeFileSync(join(root, "src/tokens.css"), ":root { --brand-ink: #111; --surface-panel: #fff; }");
    run(["init", root]);
    const context = JSON.parse(readFileSync(join(root, ".designgate/project-context.json"), "utf8"));
    expect(context.designTokens).toEqual(expect.arrayContaining(["--brand-ink", "--surface-panel"]));
    expect(context.reusableComponents).toContain("Button");
  });

  it("runs inline Tier B vision grading inside the bounded loop and passes exact visual critique to the generator", async () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-tier-b-")); created.push(root);
    mkdirSync(join(root, "src/components"), { recursive: true });
    writeFileSync(join(root, "src/components/Card.tsx"), "export const Card = () => null;");
    const html = join(root, "index.html");
    writeFileSync(html, "<style>:root{--background:#111}body{font-family:Arial;display:grid;gap:1rem;transition:opacity}@media (max-width:700px){body{padding:1rem}}@media (prefers-reduced-motion:reduce){*{transition:none}}</style><button aria-label='quality'>Render</button>");
    run(["init", root]);
    writeFileSync(join(root, "generator.mjs"), "import { appendFileSync } from 'node:fs'; appendFileSync('tier-b-feedback.txt', process.argv.slice(2).join(' ') + '\\n---\\n');");
    const mock = await startVisionServer(root);
    try {
      try { run(["loop", root, "--generator", `${process.execPath} generator.mjs`, "--grade", "--target", html, "--max-iterations", "1"], { ...process.env, ANTHROPIC_API_KEY: "test-key", ANTHROPIC_BASE_URL: mock.baseUrl }); } catch { /* expected because mock visual scores are below the configured threshold */ }
    } finally { mock.stop(); }
    const report = JSON.parse(readFileSync(join(root, ".designgate/report.json"), "utf8"));
    const feedback = readFileSync(join(root, "tier-b-feedback.txt"), "utf8");
    expect(report.tierB).toMatchObject({ provider: "anthropic", model: "claude-sonnet-4-6", source: "inline-anthropic-vision", evaluatedBreakpoints: ["mobile", "tablet", "desktop"] });
    expect(report.projectContext.designTokens).toContain("--background");
    expect(feedback.startsWith("Phase-0 project context")).toBe(true);
    expect(feedback).toContain("Generate or update the requested interface now.");
    expect(feedback).toContain("Improve variance: Increase hierarchy and distinctiveness.");
  });

  it("installs the additive immersive3d extension and emits 3D evidence checks", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-immersive-")); created.push(root);
    mkdirSync(join(root, "src/components"), { recursive: true });
    writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: { three: "^0.170.0" } }));
    const html = join(root, "index.html");
    writeFileSync(html, "<style>body{margin:0;display:grid;gap:1rem}@media (max-width:700px){body{padding:1rem}}@media (prefers-reduced-motion:reduce){*{transition:none}}</style><canvas aria-label='3D scene' width='400' height='300'></canvas>");
    run(["init", root, "--preset", "gaming-3d"]);
    const installed = JSON.parse(readFileSync(join(root, ".designgate/manifest.json"), "utf8"));
    expect(installed.extensionRules.map((rule: { id: string }) => rule.id)).toEqual(expect.arrayContaining(["DG-3D-001", "DG-3D-002", "DG-DEPTH-001", "DG-INTERACT-001", "DG-PERF-001"]));
    const capture = JSON.parse(run(["render", html, "--project", root]));
    expect(capture.captures).toHaveLength(3);
    expect(capture.captures.every((item: { immersive: { canvasCount: number } }) => item.immersive.canvasCount >= 1)).toBe(true);
    try { run(["verify", root]); } catch { /* the minimal fixture intentionally lacks all required evidence */ }
    const report = JSON.parse(readFileSync(join(root, ".designgate/report.json"), "utf8"));
    expect(report.checks.map((check: { id: string }) => check.id)).toEqual(expect.arrayContaining(["DG-3D-001", "DG-3D-002", "DG-DEPTH-001", "DG-INTERACT-001", "DG-PERF-001"]));
  });

  it("plans supported Goal Mode categories and fails unknown categories explicitly", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-goal-")); created.push(root);
    run(["init", root]);
    const brief = JSON.parse(run(["plan", "Build a multiplayer 3D game with a cinematic lobby", "--project", root]));
    expect(brief.category).toBe("gaming");
    expect(brief.stack.framework).toBe("React + Vite");
    expect(brief.ruleExtensions).toContain("immersive3d");
    expect(existsSync(join(root, ".designgate/goal-brief.json"))).toBe(true);
    expect(() => run(["plan", "Build a tax compliance admin tool", "--project", root])).toThrow(/Unknown Goal Mode category/);
  });

  it("fails safely with an actionable message when inline vision grading has no Claude API key", () => {
    const root = mkdtempSync(join(tmpdir(), "designgate-no-key-")); created.push(root);
    run(["init", root]);
    const html = join(root, "index.html");
    writeFileSync(html, "<main>Captured before the credential validation.</main>");
    run(["render", html, "--project", root]);
    expect(() => run(["grade", root], { ...process.env, ANTHROPIC_API_KEY: "" })).toThrow(/Inline Tier B grading needs ANTHROPIC_API_KEY/);
  });
});
