#!/usr/bin/env node
// Adds the new MM-* rules to rules/manifest.json with deterministic payload hashes.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const manifestPath = join(root, "rules/manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function payloadHash(value) {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

const newRules = [
  {
    id: "DG-MOTION-002",
    category: "motion",
    required: false,
    payload: {
      instruction: "Use a deliberate motion choreography: sequenced entrances, scroll-driven reveals or parallax, and easing with personality; prefer one motion library (GSAP, Framer Motion/motion.dev, or Motion One) and keep every animation under 500ms with a prefers-reduced-motion path.",
    },
  },
  {
    id: "DG-DEPTH-002",
    category: "layout",
    required: false,
    payload: {
      instruction: "Add perceived depth to the page through layered parallax, perspective or tilt transforms, glow and spotlight effects, or a real canvas/WebGL surface, so the design never reads as a flat static template.",
    },
  },
  {
    id: "DG-COMP-002",
    category: "components",
    required: false,
    payload: {
      instruction: "Give at least five interactive surfaces engineered pointer states in the style of 21st.dev components: tilt or 3D cards, shimmer buttons, dock or morphing navigation, marquees, number tickers, bento grids, text reveals, or cursor effects.",
    },
  },
];

const existingIds = new Set(manifest.rules.map((r) => r.id));
for (const rule of newRules) {
  if (!existingIds.has(rule.id)) {
    rule.hash = payloadHash(rule.payload);
    manifest.rules.push(rule);
    console.log(`Added ${rule.id} with hash ${rule.hash}`);
  } else {
    console.log(`Skipped existing ${rule.id}`);
  }
}
manifest.version = "2026.08.17";
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("manifest.json updated");
