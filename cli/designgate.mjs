#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

const here = resolve(new URL("..", import.meta.url).pathname);
const manifest = JSON.parse(readFileSync(join(here, "rules/manifest.json"), "utf8"));
const skill = readFileSync(join(here, "rules/designgate-modern-ui.md"), "utf8");
const adapters = ["generic", "claude-code", "cursor", "codex-cli", "gemini-cli", "copilot"];
const configName = "designgate.config.json";

function usage() {
  console.log(`DesignGate — installable UI quality rules and verification loop\n\nCommands:\n  npx designgate init [path] [--agent <name>]   install rules and config\n  npx designgate rules [path]                   print installed rule IDs\n  npx designgate verify [path]                 verify rule application\n  npx designgate check <target>                verify and write .designgate/report.json\n  npx designgate loop <target> --generator \"cmd\" [--max-iterations 5]\n\nAgents: ${adapters.join(", ")}\n`);
}
function hash(text) { return createHash("sha256").update(text).digest("hex").slice(0, 16); }
function payloadHash(payload) { return `sha256:${createHash("sha256").update(JSON.stringify(payload)).digest("hex")}`; }
function readConfig(root) {
  const path = join(root, configName);
  if (!existsSync(path)) return { threshold: { overall: 3.5, perDimensionFloor: 2 }, maxIterations: 5, tierA: {}, tierB: { gradingModel: "auto", dimensions: manifest.rules.filter(r => ["variance","motion","density","assetDependence","brandFidelity"].includes(r.id)).map(r => ({ name: r.id, weight: 0.2 })) } };
  return JSON.parse(readFileSync(path, "utf8"));
}
function walk(root, out = []) {
  for (const name of readdirSync(root)) {
    if (["node_modules", ".git", ".designgate", "dist", "build"].includes(name)) continue;
    const path = join(root, name); const stat = statSync(path);
    if (stat.isDirectory()) walk(path, out); else if (/\.(tsx?|jsx?|vue|svelte|css|scss|html|md|json)$/.test(name)) out.push(path);
  }
  return out;
}
function collectText(root) { return walk(root).map(path => ({ path, text: readFileSync(path, "utf8") })); }
function init(root, agent = "generic") {
  mkdirSync(join(root, ".designgate", "agents"), { recursive: true });
  if (!existsSync(join(root, configName))) writeFileSync(join(root, configName), JSON.stringify({ threshold: { overall: 3.5, perDimensionFloor: 2 }, maxIterations: 5, tierA: { fonts: { enabled: true, severity: "warning" }, gradients: { enabled: true, severity: "warning" }, spacing: { enabled: true, severity: "warning" }, contrast: { enabled: true, severity: "blocker" }, responsive: { enabled: true, severity: "blocker" }, icons: { enabled: true, severity: "warning" } }, tierB: { dimensions: ["variance", "motion", "density", "assetDependence", "brandFidelity"].map(name => ({ name, weight: 0.2 })), gradingModel: "auto", anchorSet: "default", useProjectContext: true } }, null, 2) + "\n");
  const manifestCopy = { ...manifest, installedAt: new Date().toISOString(), installedAgent: agent, sourceHash: hash(skill) };
  writeFileSync(join(root, ".designgate", "manifest.json"), JSON.stringify(manifestCopy, null, 2) + "\n");
  for (const name of adapters) writeFileSync(join(root, ".designgate", "agents", `${name}.md`), `# DesignGate adapter: ${name}\n\n${skill}\n\nInstalled rules: ${manifest.rules.map(r => r.id).join(", ")}\nManifest hash: ${manifestCopy.sourceHash}\n`);
  console.log(`DesignGate installed in ${root}\nRules: ${manifest.rules.length}\nAdapter: ${agent}\nConfig: ${configName}`);
}
function verify(root) {
  const files = collectText(root); const all = files.map(f => f.text).join("\n"); const lower = all.toLowerCase();
  const has = (...terms) => terms.some(term => lower.includes(term));
  const evidence = {
    "DG-TYPO-001": [has("font-family", "font-display", "@import"), "font declarations or imports"],
    "DG-COLOR-001": [has("--color-", "--background", "--foreground", "bg-accent") && !has("purple-to-pink", "from-purple-", "to-pink-"), "semantic color tokens without generic purple-pink treatment"],
    "DG-LAYOUT-001": [has("display: grid", "display: flex", "grid-cols-", "flex-col") && has("gap-", "space-y-", "padding", "p-"), "layout primitives and spacing evidence"],
    "DG-MOTION-001": [has("transition", "animation", "framer-motion", "motion-") && has("prefers-reduced-motion", "motion-reduce"), "motion plus reduced-motion fallback"],
    "DG-RESP-001": [has("@media", "sm:", "md:", "lg:", "grid-cols-") && !has("overflow-x: scroll", "overflow-x-scroll"), "responsive breakpoint rules without forced horizontal scrolling"],
    "DG-A11Y-001": [has("aria-", "alt=", "focus-visible", "<button", "<label"), "semantic/accessibility and focus evidence"],
    "DG-ASSET-001": [!has("placeholder.com", "unsplash.com/", "lorem ipsum"), "no obvious placeholder or stock dependency"],
    "DG-COMP-001": [existsSync(join(root, "src/components")) || existsSync(join(root, "client/src/components")) || has("components/"), "component directory or imports"],
    "DG-VERIFY-001": [existsSync(join(root, ".designgate", "manifest.json")) && files.some(file => /report|screenshot|iteration|changed/i.test(file.text)), "manifest plus verification evidence"]
  };
  let changedFiles = []; try { changedFiles = execSync("git diff --name-only HEAD~1 HEAD", { cwd: root, encoding: "utf8" }).trim().split("\\n").filter(Boolean); } catch { changedFiles = files.map(file => relative(root, file.path)).slice(0, 20); }
  const installedManifestPath = join(root, ".designgate", "manifest.json"); const installedManifest = existsSync(installedManifestPath);
  const installed = installedManifest ? JSON.parse(readFileSync(installedManifestPath, "utf8")) : null;
  const agentDir = join(root, ".designgate", "agents"); const agentFiles = existsSync(agentDir) ? readdirSync(agentDir).filter(name => name.endsWith(".md")).map(name => ({ path: join(agentDir, name), text: readFileSync(join(agentDir, name), "utf8") })) : [];
  const agentOutputPresent = installedManifest && agentFiles.length > 0;
  const agentOutputMatching = Boolean(installed?.sourceHash && agentFiles.some(file => file.text.includes(installed.sourceHash) && manifest.rules.every(rule => file.text.includes(rule.id))));
  const classifiedChanges = changedFiles.reduce((acc, file) => { const category = /\.(tsx?|jsx?)$/.test(file) ? "code" : /\.(css|scss)$/.test(file) ? "styles" : /\.(json|md)$/.test(file) ? "config-docs" : "other"; (acc[category] ??= []).push(file); return acc; }, {});
  const checks = manifest.rules.map(rule => {
    const [artifactEvidence, evidenceLabel] = evidence[rule.id] ?? [false, "no verifier registered"];
    const payloadHashValid = rule.hash === payloadHash(rule.payload);
    const applied = artifactEvidence && payloadHashValid && agentOutputPresent && agentOutputMatching;
    return { id: rule.id, category: rule.category, required: rule.required, applied, payloadHash: rule.hash, payloadHashValid, changedFiles, classifiedChanges, agentOutputPresent, agentOutputMatching, evidence: evidenceLabel, detail: applied ? `Verified ${evidenceLabel}.` : `Missing concrete evidence for ${rule.id}; exact instruction: ${rule.payload.instruction}` };
  });
  const required = checks.filter(c => c.required); const passed = required.filter(c => c.applied).length;
  return { schemaVersion: "1.1.0", target: root, timestamp: new Date().toISOString(), score: Math.round((passed / Math.max(1, required.length)) * 100), passed: passed === required.length, ruleSet: manifest.ruleSet, manifestVersion: manifest.version, manifestHash: hash(skill), checks };
}
function writeReport(root, report) { mkdirSync(join(root, ".designgate"), { recursive: true }); writeFileSync(join(root, ".designgate", "report.json"), JSON.stringify(report, null, 2) + "\n"); }
function parseFlag(args, name, fallback) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; }
function main() {
  const [command, rawPath = ".", ...rest] = process.argv.slice(2); if (!command || command === "--help" || command === "-h") return usage();
  const root = resolve(rawPath.startsWith("-") ? "." : rawPath);
  if (command === "init" || command === "install") return init(root, parseFlag(rest, "--agent", "generic"));
  if (command === "rules") { const installed = existsSync(join(root, ".designgate", "manifest.json")); console.log(JSON.stringify({ installed, ruleSet: manifest.ruleSet, version: manifest.version, rules: manifest.rules }, null, 2)); return; }
  if (command === "verify") { const report = verify(root); writeReport(root, report); console.log(JSON.stringify(report, null, 2)); process.exitCode = report.passed ? 0 : 1; return; }
  if (command === "check") { const target = resolve(rawPath); const report = verify(root); report.target = target; writeReport(root, report); console.log(JSON.stringify(report, null, 2)); process.exitCode = report.passed ? 0 : 1; return; }
  if (command === "loop") {
    const generator = parseFlag(rest, "--generator", ""); const max = Number(parseFlag(rest, "--max-iterations", readConfig(root).maxIterations ?? 5));
    if (!generator) throw new Error("loop requires --generator \"command\"");
    for (let iteration = 1; iteration <= max; iteration++) { const report = verify(root); report.iteration = iteration; writeReport(root, report); console.log(`DesignGate iteration ${iteration}/${max}: ${report.score}/100 ${report.passed ? "PASS" : "FAIL"}`); if (report.passed) return; const feedback = report.checks.filter(c => c.required && !c.applied).map(c => c.detail).join("\n"); try { execSync(`${generator} ${JSON.stringify(`\n\nDesignGate exact feedback:\n${feedback}`)}`, { cwd: root, stdio: "inherit", timeout: 180000 }); } catch (error) { console.error(`Generator failed on iteration ${iteration}: ${error.message}`); process.exitCode = 2; return; } }
    process.exitCode = 1; return;
  }
  usage(); process.exitCode = 1;
}
main();
