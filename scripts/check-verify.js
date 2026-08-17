import { readFileSync } from "node:fs";

const txt = readFileSync(process.argv[2], "utf8");
const m = txt.match(/\{[\s\S]*\}/);
if (!m) {
  console.log("no JSON found");
  process.exit(1);
}
const d = JSON.parse(m[0]);
console.log("score:", d.score, "passed:", d.passed);
for (const c of d.checks) {
  if (c.required && !c.applied) console.log("FAIL-REQ:", c.id, "-", c.evidence, "| payloadHashValid:", c.payloadHashValid);
  if (!c.required && !c.applied) console.log("fail-opt:", c.id);
}
