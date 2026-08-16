import { assertVisionConfig, result } from "./types.mjs";

export const anthropicProvider = {
  name: "anthropic",
  async grade(images, prompt, config) {
    const apiKey = assertVisionConfig({ ...config, provider: "anthropic" });
    const content = [{ type: "text", text: prompt }, ...images.map((image) => ({ type: "image", source: { type: "base64", media_type: image.mediaType ?? "image/png", data: image.data } }))];
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: config.model, max_tokens: config.maxTokens ?? 1400, system: "Return only valid JSON; do not include Markdown fences.", messages: [{ role: "user", content }] }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Anthropic vision grading failed (${response.status}): ${body?.error?.message || "unknown API error"}`);
    const text = body?.content?.find((item) => item.type === "text")?.text;
    if (typeof text !== "string") throw new Error("Anthropic vision grading returned no text result.");
    return result("anthropic", config, text);
  },
};
