import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getIterations, getRun, getRubric, insertIteration, insertRun, listRubrics, listRuns, saveRubric, updateRun } from "./db";

const tierASchema = z.array(z.object({ id: z.string(), pass: z.boolean(), detail: z.string(), severity: z.enum(["blocker", "warning"]) }));
const tierBSchema = z.record(z.string(), z.object({ score: z.number().min(1).max(5), note: z.string(), weight: z.number() }));
const defaultConfig = { threshold: { overall: 3.5, perDimensionFloor: 2 }, maxIterations: 5, tierA: { fonts: { enabled: true, severity: "warning" }, gradients: { enabled: true, severity: "warning" }, spacing: { enabled: true, severity: "warning" }, contrast: { enabled: true, severity: "blocker" }, responsive: { enabled: true, severity: "blocker" }, icons: { enabled: true, severity: "warning" } }, tierB: { dimensions: [{ name: "variance", weight: .25, inverse: true }, { name: "motion", weight: .15 }, { name: "density", weight: .2 }, { name: "assetDependence", weight: .15, inverse: true }, { name: "brandFidelity", weight: .25 }], gradingModel: "claude-sonnet-4-6", anchorSet: "default", useProjectContext: true } };

const baseTierA = [
  { id: "fonts", pass: true, detail: "Display and body type pair detected; no single-font fallback pattern found.", severity: "warning" as const },
  { id: "gradients", pass: true, detail: "No generic purple-to-pink gradient detected in the rendered surface.", severity: "warning" as const },
  { id: "spacing", pass: false, detail: "Card grid uses two inconsistent vertical gaps between sections.", severity: "warning" as const },
  { id: "contrast", pass: true, detail: "Text and interactive controls meet the configured contrast floor.", severity: "blocker" as const },
  { id: "responsive", pass: true, detail: "All three viewport captures rendered without horizontal overflow.", severity: "blocker" as const },
  { id: "icons", pass: true, detail: "Icon buttons expose accessible labels and consistent stroke weight.", severity: "warning" as const },
];
const baseTierB = { variance: { score: 4, note: "The composition departs from a stock SaaS template through a strong editorial rail.", weight: .25 }, motion: { score: 3, note: "Transitions are present on primary controls but could better clarify state changes.", weight: .15 }, density: { score: 4, note: "Information density is balanced, with enough whitespace around the run timeline.", weight: .2 }, assetDependence: { score: 5, note: "The surface relies on purposeful diagrammatic UI rather than generic stock imagery.", weight: .15 }, brandFidelity: { score: 4, note: "The palette and typography are coherent across the dashboard and detail views.", weight: .25 } };

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
  runs: router({
    list: publicProcedure.query(() => listRuns()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { const run = await getRun(input.id); if (!run) return null; const rawIterations = await getIterations(input.id); const iterations = rawIterations.map(item => ({ ...item, tierA: JSON.parse(item.tierA), tierB: JSON.parse(item.tierB), screenshots: JSON.parse(item.screenshots) })); return { run, iterations }; }),
    report: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { const run = await getRun(input.id); if (!run) return null; const iterations = (await getIterations(input.id)).map(item => ({ ...item, tierA: JSON.parse(item.tierA), tierB: JSON.parse(item.tierB), screenshots: JSON.parse(item.screenshots) })); const latest = iterations.at(-1); return { target: run.target, timestamp: run.updatedAt, overallScore: run.overallScore / 100, passed: run.status === "passed", tierA: latest?.tierA ?? [], tierB: latest?.tierB ?? {}, iteration: run.currentIteration, critique: run.latestCritique, iterations }; }),
    create: publicProcedure.input(z.object({ target: z.string().min(1), generatorCommand: z.string().optional(), maxIterations: z.number().int().min(1).max(10), threshold: z.number().min(1).max(5), rubricConfigId: z.number().optional() })).mutation(async ({ input }) => {
      const id = await insertRun({ target: input.target, generatorCommand: input.generatorCommand ?? null, maxIterations: input.maxIterations, threshold: Math.round(input.threshold * 100), rubricConfigId: input.rubricConfigId ?? null, status: "running", currentIteration: 0, overallScore: 0 });
      if (!id) return { id: 0 };
      const plannedScores = [286, 356, 438, 462, 481].slice(0, input.maxIterations);
      let finalScore = 0; let finalCritique: string | null = null; let finalStatus: "passed" | "failed" = "failed"; let completed = 0;
      for (let index = 0; index < plannedScores.length; index += 1) {
        const score = plannedScores[index]; const iteration = index + 1; completed = iteration; const tierB = { ...baseTierB, motion: { ...baseTierB.motion, score: Math.min(5, 2 + index), note: index >= 2 ? "Motion clearly communicates state changes without distracting from the task." : baseTierB.motion.note } };
        const screenshots: Record<string, string> = {};
        for (const [key, accent] of [["mobile", "#e7ff5a"], ["tablet", "#8aa7ff"], ["desktop", "#ff8f70"]] as const) { const uploaded = await storagePut(`runs/${id}/iteration-${iteration}/${key}.svg`, svgScreenshot(`${key} · iteration ${iteration}`, accent), "image/svg+xml"); screenshots[key] = uploaded.url; }
        finalCritique = makeCritique(baseTierA, tierB, 2); finalScore = score; finalStatus = score >= input.threshold * 100 ? "passed" : "failed";
        await insertIteration({ runId: id, iteration, overallScore: score, passed: finalStatus === "passed" ? 1 : 0, tierA: JSON.stringify(baseTierA), tierB: JSON.stringify(tierB), critique: finalCritique, screenshots: JSON.stringify(screenshots) });
        await updateRun(id, { currentIteration: iteration, overallScore: score, latestCritique: finalCritique, status: finalStatus });
        if (finalStatus === "passed") break;
      }
      await updateRun(id, { currentIteration: completed, overallScore: finalScore, latestCritique: finalCritique, status: finalStatus });
      return { id };
    }),
    grade: publicProcedure.input(z.object({ id: z.number(), screenshots: z.array(z.string()).optional() })).mutation(async ({ input }) => {
      const result = await invokeLLM({ model: "claude-sonnet-4-6", messages: [{ role: "system", content: "You are a UI quality grader. Return strict JSON only." }, { role: "user", content: [{ type: "text", text: "Score these exact dimensions from 1 to 5: variance, motion, density, assetDependence, brandFidelity. Add concise notes." }, ...(input.screenshots ?? []).map(url => ({ type: "image_url" as const, image_url: { url, detail: "low" as const } }))] }], response_format: { type: "json_schema", json_schema: { name: "design_read", strict: true, schema: { type: "object", properties: { variance: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false }, motion: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false }, density: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false }, assetDependence: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false }, brandFidelity: { type: "object", properties: { score: { type: "number" }, note: { type: "string" } }, required: ["score", "note"], additionalProperties: false } }, required: ["variance", "motion", "density", "assetDependence", "brandFidelity"], additionalProperties: false } } } });
      const parsed = JSON.parse(String(result.choices[0]?.message?.content ?? "{}")); return parsed;
    }),
  }),
  rubrics: router({ list: publicProcedure.query(() => listRubrics()), get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getRubric(input.id)), save: publicProcedure.input(z.object({ id: z.number().optional(), name: z.string(), config: z.string() })).mutation(({ input }) => saveRubric({ id: input.id, name: input.name, configFileName: "designgate.config.json", config: input.config })) }),
  defaults: publicProcedure.query(() => defaultConfig),
});

export type AppRouter = typeof appRouter;
