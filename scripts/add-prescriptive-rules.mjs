#!/usr/bin/env node
// Registers the four world-class prescriptive rule markdown files so they ship
// inside the agent instruction (skill text) and appear in `designgate rules`.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = resolve(new URL("..", import.meta.url).pathname);
const cliPath = join(here, "cli/designgate.mjs");
const pkgPath = join(here, "package.json");

const ruleFiles = [
  "designgate-world-class-typography.md",
  "designgate-world-class-color.md",
  "designgate-world-class-imagery.md",
  "designgate-motion-bible.md",
];

// 1) CLI: make the skill text the concatenation of the core skill + prescriptive rules
let cli = readFileSync(cliPath, "utf8");

const marker = "const skill = readFileSync(join(here, \"rules/designgate-modern-ui.md\"), \"utf8\");";
const replacement = [
  "const prescriptiveRules = [",
  ...ruleFiles.map((f) => `  "rules/${f}",`),
  "];",
  'const skill = [readFileSync(join(here, "rules/designgate-modern-ui.md"), "utf8")]',
  '  .concat(prescriptiveRules.map((f) => readFileSync(join(here, f), "utf8"))).join("\\n\\n---\\n\\n");',
].join("\n");

if (cli.includes(marker)) {
  cli = cli.replace(marker, replacement);
  writeFileSync(cliPath, cli);
  console.log("CLI skill text now includes prescriptive rule files");
} else {
  console.error("CLI marker not found — check line 13");
  process.exit(1);
}

// 2) package.json: ensure rules files are in the files list (whole rules dir already included)
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
if (!pkg.files.includes("rules")) {
  pkg.files.push("rules");
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("package.json files list updated");
} else {
  console.log("package.json already includes rules dir");
}
