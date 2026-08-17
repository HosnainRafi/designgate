#!/usr/bin/env node
// Smoke-tests the new presets without Playwright rendering:
// loads each preset, runs init in a temp dir, and runs verify.
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";

const here = resolve(new URL("..", import.meta.url).pathname);
const cli = resolve(here, "cli/designgate.mjs");

const fakeProject = mkdtempSync(join(tmpdir(), "dg-test-"));
mkdirSync(join(fakeProject, "client/src/components"), { recursive: true });
mkdirSync(join(fakeProject, "client/src/styles"), { recursive: true });
writeFileSync(
  join(fakeProject, "package.json"),
  JSON.stringify({ name: "dg-test", dependencies: { gsap: "^3", "framer-motion": "^11", three: "^0.160" } })
);
writeFileSync(
  join(fakeProject, "client/src/components/Hero.tsx"),
  `import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function Hero() {
  // staggered entrance choreography with pinned scroll timeline
  gsap.from(".hero-line", { y: 40, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out" });
  gsap.to(".pin-panel", { yPercent: -20, ease: "none", scrollTrigger: { trigger: ".pin", pin: true, scrub: 1 } });
  return <section className="hero"><h1 className="hero-line">Motion</h1></section>;
}`
);
writeFileSync(
  join(fakeProject, "client/src/styles/globals.css"),
  `:root { --color-surface: #0b0d12; --color-ink: #f5f7fa; --color-accent: #7c5cff; }\n@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }\n@media (min-width: 768px) { .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 4rem; } }\n`
);

const presets = ["modern-motion", "modern-motion-3d"];
for (const preset of presets) {
  console.log(`\n=== init with preset ${preset} ===`);
  rmSync(join(fakeProject, ".designgate"), { recursive: true, force: true });
  rmSync(join(fakeProject, "designgate.config.json"), { force: true });
  execSync(`node ${cli} init "${fakeProject}" --agent generic --preset ${preset}`, { stdio: "inherit" });
  const installed = JSON.parse(readFileSync(join(fakeProject, ".designgate/manifest.json")));
  console.log("installed preset:", installed.preset, "| extensionRules:", installed.extensionRules.length, "| presetExtensions:", installed.presetExtensions);
  console.log(`=== verify with preset ${preset} ===`);
  execSync(`node ${cli} verify "${fakeProject}"`, { stdio: "inherit" });
}

console.log("\n=== preset list check ===");
execSync(`node ${cli} rules "${fakeProject}"`, { stdio: "inherit" });
rmSync(fakeProject, { recursive: true, force: true });
console.log("\nAll preset smoke tests finished.");
