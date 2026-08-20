#!/usr/bin/env node
// Fetches the latest official Vercel Web Interface Guidelines from the upstream
// vercel-labs/web-interface-guidelines repository and saves a timestamped snapshot
// into rules/ for offline use and drift comparison.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";

const VERCEL_SOURCE = "https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md";

async function main() {
  const root = resolve(new URL("..", import.meta.url).pathname);
  const out = join(root, "rules", "vercel-web-interface-guidelines-latest.md");
  const historyDir = join(root, "rules", ".vercel-guidelines-history");
  mkdirSync(historyDir, { recursive: true });
  const response = await fetch(VERCEL_SOURCE);
  if (!response.ok) throw new Error(`Failed to fetch Vercel guidelines (${response.status}) from ${VERCEL_SOURCE}`);
  const text = await response.text();
  writeFileSync(out, text + "\n");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const hash = createHash("sha256").update(text).digest("hex").slice(0, 16);
  writeFileSync(join(historyDir, `${stamp}-${hash}.md`), text + "\n");
  console.log(JSON.stringify({ source: VERCEL_SOURCE, snapshot: out, history: join(historyDir, `${stamp}-${hash}.md`), bytes: text.length, fetchedAt: new Date().toISOString() }, null, 2));
}

main().catch((error) => {
  console.error(`DesignGate error: ${error.message}`);
  process.exitCode = 2;
});
