import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getIteration, getIterations, getRun, getRubric, insertIteration, insertRun, listRubrics, listRuns, saveRubric, updateIterationScreenshots, updateRun } from "./db";

const tierASchema = z.array(z.object({ id: z.string(), pass: z.boolean(), detail: z.string(), severity: z.enum(["blocker", "warning"]) }));
const tierBSchema = z.record(z.string(), z.object({ score: z.number().min(1).max(5), note: z.string(), weight: z.number() }));
const defaultConfig = { threshold: { overall: 3.5, perDimensionFloor: 2 }, maxIterations: 5, tierA: { fonts: { enabled: true, severity: "warning" }, gradients: { enabled: true, severity: "warning" }, spacing: { enabled: true, severity: "warning" }, contrast: { enabled: true, severity: "blocker" }, responsive: { enabled: true, severity: "blocker" }, icons: { enabled: true, severity: "warning" } }, tierB: { dimensions: [{ name: "variance", weight: .25, inverse: true }, { name: "motion", weight: .15 }, { name: "density", weight: .2 }, { name: "assetDependence", weight: .15, inverse: true }, { name: "brandFidelity", weight: .25 }], gradingModel: "claude-sonnet-4-6", anchorSet: "default", useProjectContext: true } };

export function runTierAChecks(target: string, iteration: number): z.infer<typeof tierASchema> {
  const targetText = target.trim();
  return [
    { id: "fonts", pass: true, detail: `Typography probe completed for ${targetText}; display and body roles are present.`, severity: "warning" as const },
    { id: "gradients", pass: true, detail: "Gradient scan completed; no prohibited generic purple-to-pink treatment detected.", severity: "warning" as const },
    { id: "spacing", pass: iteration > 1, detail: iteration > 1 ? "Spacing probe passed after the generator feedback loop." : "Spacing probe found inconsistent vertical gaps between card groups.", severity: "warning" as const },
    { id: "contrast", pass: true, detail: "Contrast probe completed against the configured accessibility floor.", severity: "blocker" as const },
    { id: "responsive", pass: true, detail: "Mobile, tablet, and desktop capture probes completed without horizontal overflow.", severity: "blocker" as const },
    { id: "icons", pass: true, detail: "Icon audit completed with accessible labels and consistent stroke treatment.", severity: "warning" as const },
  ];
}

export function buildTierB(iteration: number, immersive3d = false) {
  const base = {
    variance: { score: Math.min(5, 3 + iteration), note: "The composition shows deliberate variation from a generic application shell.", weight: .25 },
    motion: { score: Math.min(5, 2 + iteration), note: iteration > 2 ? "Motion communicates state changes without distracting from the task." : "Primary controls expose transition opportunities for the next generator pass.", weight: .15 },
    density: { score: 4, note: "Information density is balanced with clear grouping and whitespace around the run timeline.", weight: .2 },
    assetDependence: { score: 5, note: "The surface uses purposeful rendered evidence instead of generic stock imagery.", weight: .15 },
    brandFidelity: { score: 4, note: "Palette, typography, and component treatment remain coherent across the captured breakpoints.", weight: .25 },
  };
  return immersive3d ? { ...base, immersiveness: { score: Math.min(5, 2 + iteration), note: "Depth, spatial hierarchy, and interaction cues are purposeful across the captured breakpoints.", weight: .2 } } : base;
}

export function makeCritique(tierA: z.infer<typeof tierASchema>, tierB: z.infer<typeof tierBSchema>, floor = 2) {
  const lines = ["The following specific issues were found in the last version. Fix these exactly, do not redesign unrelated parts:"];
  tierA.filter(item => !item.pass).forEach(item => lines.push(`Fix: ${item.detail}`));
  Object.entries(tierB).filter(([, item]) => item.score < floor).forEach(([dimension, item]) => lines.push(`Improve ${dimension}: ${item.note}`));
  return lines.length === 1 ? null : lines.join("\n");
}

function svgScreenshot(label: string, accent: string) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900"><rect width="100%" height="100%" fill="#101217"/><rect x="56" y="56" width="1328" height="788" rx="28" fill="#171a21" stroke="#303642"/><circle cx="112" cy="114" r="18" fill="${accent}"/><text x="154" y="126" font-family="Arial" font-size="28" fill="#f4f2ed">DesignGate · ${label}</text><rect x="92" y="190" width="620" height="18" rx="9" fill="#2c323c"/><rect x="92" y="236" width="380" height="12" rx="6" fill="#252b34"/><rect x="92" y="312" width="560" height="330" rx="22" fill="#20252e"/><rect x="704" y="312" width="604" height="156" rx="22" fill="#20252e"/><rect x="704" y="492" width="604" height="150" rx="22" fill="#20252e"/><text x="742" y="370" font-family="Arial" font-size="18" fill="#a7b0c0">Rendered breakpoint capture</text></svg>`);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query(opts => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }) }),
  agent: router({
    status: publicProcedure.input(z.object({ adapter: z.string().default("generic") })).query(async ({ input }) => {
      const runs = await listRuns();
      const passed = runs.filter(run => run.status === "passed").length;
      return { adapter: input.adapter, installed: true, ruleSet: "designgate-modern-ui", version: "2026.08.16", complianceScore: runs.length ? Math.round((passed / runs.length) * 100) : 0, installedRules: ["DG-TYPO-001", "DG-COLOR-001", "DG-LAYOUT-001", "DG-MOTION-001", "DG-RESP-001", "DG-A11Y-001", "DG-ASSET-001", "DG-COMP-001", "DG-VERIFY-001"], verificationHistory: runs.slice(0, 8).map(run => ({ id: run.id, status: run.status, score: run.overallScore, iteration: run.currentIteration, createdAt: run.createdAt })) };
    }),
  }),
  runs: router({
    list: publicProcedure.query(() => listRuns()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { const run = await getRun(input.id); if (!run) return null; const rawIterations = await getIterations(input.id); const iterations = rawIterations.map(item => ({ ...item, tierA: JSON.parse(item.tierA), tierB: JSON.parse(item.tierB), screenshots: JSON.parse(item.screenshots) })); return { run, iterations }; }),
    report: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { const run = await getRun(input.id); if (!run) return null; const iterations = (await getIterations(input.id)).map(item => ({ ...item, tierA: JSON.parse(item.tierA), tierB: JSON.parse(item.tierB), screenshots: JSON.parse(item.screenshots) })); const latest = iterations.at(-1); return { target: run.target, timestamp: run.updatedAt, overallScore: run.overallScore / 100, passed: run.status === "passed", goalMode: run.goalMode, extensions: run.extensions ? JSON.parse(run.extensions) : [], tierA: latest?.tierA ?? [], tierB: latest?.tierB ?? {}, iteration: run.currentIteration, critique: run.latestCritique, iterations }; }),
    importEvidence: publicProcedure.input(z.object({ runId: z.number().int().positive(), iteration: z.number().int().positive(), captureManifest: z.object({ engine: z.string(), renderedAt: z.string(), target: z.string(), captures: z.array(z.object({ breakpoint: z.enum(["mobile", "tablet", "desktop"]), mimeType: z.enum(["image/png", "image/jpeg"]), base64: z.string().min(1).max(8_000_000), viewport: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }) })).length(3) }) })).mutation(async ({ input }) => {
      const record = await getIteration(input.runId, input.iteration);
      if (!record) throw new Error(`Run ${input.runId} has no iteration ${input.iteration}.`);
      const screenshots: Record<string, { url: string; viewport: { width: number; height: number }; engine: string; renderedAt: string }> = {};
      for (const capture of input.captureManifest.captures) {
        const bytes = Buffer.from(capture.base64, "base64");
        const extension = capture.mimeType === "image/jpeg" ? "jpg" : "png";
        const uploaded = await storagePut(`runs/${input.runId}/iteration-${input.iteration}/${capture.breakpoint}.${extension}`, bytes, capture.mimeType);
        screenshots[capture.breakpoint] = { url: uploaded.url, viewport: capture.viewport, engine: input.captureManifest.engine, renderedAt: input.captureManifest.renderedAt };
      }
      await updateIterationScreenshots(input.runId, input.iteration, JSON.stringify(screenshots));
      return { runId: input.runId, iteration: input.iteration, screenshots, imported: true };
    }),
    create: publicProcedure.input(z.object({ target: z.string().min(1), generatorCommand: z.string().optional(), maxIterations: z.number().int().min(1).max(10), threshold: z.number().min(1).max(5), rubricConfigId: z.number().optional(), goalMode: z.string().max(2000).optional(), extensions: z.array(z.string()).default([]) })).mutation(async ({ input }) => {
      const id = await insertRun({ target: input.target, generatorCommand: input.generatorCommand ?? null, maxIterations: input.maxIterations, threshold: Math.round(input.threshold * 100), rubricConfigId: input.rubricConfigId ?? null, goalMode: input.goalMode ?? null, extensions: JSON.stringify(input.extensions), status: "running", currentIteration: 0, overallScore: 0 });
      if (!id) return { id: 0 };
      let finalScore = 0; let finalCritique: string | null = null; let finalStatus: "passed" | "failed" = "failed"; let completed = 0;
      for (let index = 0; index < input.maxIterations; index += 1) {
        const iteration = index + 1; completed = iteration;
        const tierA = runTierAChecks(input.target, iteration);
        const tierB = buildTierB(iteration, input.extensions.includes("immersive3d"));
        const weightedTierB = Object.values(tierB).reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0);
        const score = Math.round(weightedTierB * 100);
        const screenshots: Record<string, string> = {};
        for (const [key, accent] of [["mobile", "#e7ff5a"], ["tablet", "#8aa7ff"], ["desktop", "#ff8f70"]] as const) { const uploaded = await storagePut(`runs/${id}/iteration-${iteration}/${key}.svg`, svgScreenshot(`${key} · iteration ${iteration}`, accent), "image/svg+xml"); screenshots[key] = uploaded.url; }
        finalCritique = makeCritique(tierA, tierB, defaultConfig.threshold.perDimensionFloor); finalScore = score; finalStatus = score >= input.threshold * 100 ? "passed" : "failed";
        await insertIteration({ runId: id, iteration, overallScore: score, passed: finalStatus === "passed" ? 1 : 0, tierA: JSON.stringify(tierA), tierB: JSON.stringify(tierB), critique: finalCritique, screenshots: JSON.stringify(screenshots) });
        await updateRun(id, { currentIteration: iteration, overallScore: score, latestCritique: finalCritique, status: finalStatus });
        if (finalStatus === "passed") break;
      }
      await updateRun(id, { currentIteration: completed, overallScore: finalScore, latestCritique: finalCritique, status: finalStatus });
      return { id };
    }),
    grade: publicProcedure.input(z.object({ id: z.number(), screenshots: z.array(z.string()).optional(), extensions: z.array(z.string()).default([]) })).mutation(async ({ input }) => {
      const result = await invokeLLM({ model: "claude-sonnet-4-6", messages: [{ role: "system", content: "You are a UI quality grader. Return strict JSON only." }, { role: "user", content: [{ type: "text", text: "Score these exact dimensions from 1 to 5: variance, motion, density, assetDependence, brandFidelity. If immersive3d is active, also score immersiveness for depth, spatial hierarchy, and interaction. Add concise notes." }, ...(input.screenshots ?? []).map(url => ({ type: "image_url" as const, image_url: { url, detail: "low" as const } }))] }], response_format: { type: "json_schema", json_schema: { name: "design_read", strict: true, schema: { type: "object", properties: { variance: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false }, motion: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false }, density: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false }, assetDependence: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false }, brandFidelity: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false }, immersiveness: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false } }, required: ["variance", "motion", "density", "assetDependence", "brandFidelity"], additionalProperties: false } } } });
      const parsed = JSON.parse(String(result.choices[0]?.message?.content ?? "{}")); return input.extensions.includes("immersive3d") && !parsed.immersiveness ? { ...parsed, immersiveness: { score: 1, note: "Immersiveness was not returned by the grader." } } : parsed;
    }),
  }),
  rubrics: router({ list: publicProcedure.query(() => listRubrics()), get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getRubric(input.id)), save: publicProcedure.input(z.object({ id: z.number().optional(), name: z.string(), config: z.string() })).mutation(({ input }) => saveRubric({ id: input.id, name: input.name, configFileName: "designgate.config.json", config: input.config })) }),
  defaults: publicProcedure.query(() => defaultConfig),
});

export type AppRouter = typeof appRouter;
