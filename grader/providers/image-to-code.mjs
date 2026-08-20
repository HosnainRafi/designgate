import { assertVisionConfig, result } from "./types.mjs";

const IMAGE_TO_CODE_PROMPT = `You are an expert front-end engineer. Convert the provided design screenshot into production-quality React code.

Requirements:
- Implement the design pixel-faithfully: replicate the exact layout, typography hierarchy, spacing scale, color tokens, imagery placement, and component styling visible in the screenshot.
- Use semantic HTML with Tailwind CSS utility classes and export the result as a single default React component file.
- Extract an explicit design token system: define the color palette (background, surface, text, muted, accent, border), the type scale, and spacing observed in the screenshot, and use those tokens instead of magic values.
- Make the layout responsive: preserve the desktop composition and adapt gracefully at tablet and mobile widths without horizontal overflow.
- Respect accessibility: visible focus states, alt text for imagery, semantic headings, and keyboard-reachable interactive surfaces.
- Respect prefers-reduced-motion: keep motion subtle or disable it entirely when reduced motion is preferred.
- Never invent decorative assets that are not visible in the screenshot; represent photos and illustrations with clearly marked placeholder <img> elements using descriptive alt text and the exact dimensions and aspect ratios from the design.
- Do not include Lorem Ipsum placeholder text where the screenshot shows real copy; reproduce the copy exactly.
- No preamble or commentary in the code file; return only the component code inside a single code fence.
`;

export const imageToCodeProvider = {
  name: "image-to-code",
  async code(images, config) {
    const apiKey = assertVisionConfig({ ...config, provider: config.provider ?? "anthropic" });
    const content = [
      { type: "text", text: IMAGE_TO_CODE_PROMPT },
      ...images.map((image) => ({ type: "image", source: { type: "base64", media_type: image.mediaType ?? "image/png", data: image.data } })),
    ];
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: config.model, max_tokens: config.maxTokens ?? 8000, system: "Return only a single React component file inside one code fence; no explanation before or after.", messages: [{ role: "user", content }] }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Image-to-code failed (${response.status}): ${body?.error?.message || "unknown API error"}`);
    const text = body?.content?.find((item) => item.type === "text")?.text;
    if (typeof text !== "string") throw new Error("Image-to-code returned no text result.");
    return result("image-to-code", config, text);
  },
};
