import { assertVisionConfig, result } from "./types.mjs";

export const openAICompatibleProvider = {
  name: "openai-compatible",
  async grade(images, prompt, config) {
    const apiKey = assertVisionConfig(config);
    const content = [{ type: "text", text: prompt }, ...images.map((image) => ({ type: "image_url", image_url: { url: `data:${image.mediaType ?? "image/png"};base64,${image.data}` } }))];
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: config.model, temperature: 0, max_tokens: config.maxTokens ?? 1400, messages: [{ role: "system", content: "Return only valid JSON; do not include Markdown fences." }, { role: "user", content }] }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`OpenAI-compatible vision grading failed (${response.status}): ${body?.error?.message || "unknown API error"}`);
    const text = body?.choices?.[0]?.message?.content;
    if (typeof text !== "string") throw new Error("OpenAI-compatible vision grading returned no text result.");
    return result("openai-compatible", config, text);
  },
};
