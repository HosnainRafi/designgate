import { afterEach, describe, expect, it, vi } from "vitest";
import { anthropicProvider } from "../grader/providers/anthropic.mjs";
import { openAICompatibleProvider } from "../grader/providers/openai-compatible.mjs";

const config = { model: "vision-test", baseUrl: "https://provider.test", apiKeyEnvVar: "TEST_VISION_KEY", supportsVision: true };
const images = [{ mediaType: "image/png", data: "cG5n" }];
const prompt = "Return the requested JSON.";

afterEach(() => { vi.restoreAllMocks(); delete process.env.TEST_VISION_KEY; });

describe("Tier B provider abstraction", () => {
  it("grades through the Anthropic Messages API", async () => {
    process.env.TEST_VISION_KEY = "test-key";
    const gradingJson = JSON.stringify({ variance: { score: 4, note: "Good" } });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ content: [{ type: "text", text: gradingJson }] }), { status: 200 }));
    const response = await anthropicProvider.grade(images, prompt, { ...config, provider: "anthropic" });
    expect(response).toMatchObject({ provider: "anthropic", model: "vision-test", text: expect.stringContaining("variance") });
    expect(fetchMock).toHaveBeenCalledWith("https://provider.test/v1/messages", expect.objectContaining({ method: "POST" }));
  });

  it("grades through the generic OpenAI-compatible chat completions API", async () => {
    process.env.TEST_VISION_KEY = "test-key";
    const gradingJson = JSON.stringify({ variance: { score: 4, note: "Good" } });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: gradingJson } }] }), { status: 200 }));
    const response = await openAICompatibleProvider.grade(images, prompt, { ...config, provider: "openai-compatible", baseUrl: "https://provider.test/v1" });
    expect(response).toMatchObject({ provider: "openai-compatible", model: "vision-test", text: expect.stringContaining("variance") });
    expect(fetchMock).toHaveBeenCalledWith("https://provider.test/v1/chat/completions", expect.objectContaining({ method: "POST" }));
    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(request.messages[1].content[1].image_url.url).toContain("data:image/png;base64,cG5n");
  });

  it("fails before the network call when the configured model is not vision-capable", async () => {
    process.env.TEST_VISION_KEY = "test-key";
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await expect(openAICompatibleProvider.grade(images, prompt, { ...config, provider: "openai-compatible", supportsVision: false })).rejects.toThrow(/vision input/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("passes the same golden-set score contract across two providers", async () => {
    process.env.TEST_VISION_KEY = "test-key";
    const goldenSet = {
      variance: { score: 4, note: "Intentional layout variance." },
      motion: { score: 3, note: "Motion remains restrained." },
      density: { score: 4, note: "Content density is readable." },
      assetDependence: { score: 3, note: "Assets support the hierarchy." },
      brandFidelity: { score: 4, note: "Brand tokens are consistent." },
    };
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const body = url.endsWith("/messages")
        ? { content: [{ type: "text", text: JSON.stringify(goldenSet) }] }
        : { choices: [{ message: { content: JSON.stringify(goldenSet) } }] };
      return new Response(JSON.stringify(body), { status: 200 });
    });

    const [anthropic, compatible] = await Promise.all([
      anthropicProvider.grade(images, prompt, { ...config, provider: "anthropic" }),
      openAICompatibleProvider.grade(images, prompt, { ...config, provider: "openai-compatible", baseUrl: "https://provider.test/v1" }),
    ]);
    const scoreShape = (text) => Object.fromEntries(Object.entries(JSON.parse(text)).map(([key, value]) => [key, value.score]));
    expect(scoreShape(anthropic.text)).toEqual(scoreShape(compatible.text));
    expect(Object.values(scoreShape(anthropic.text))).toEqual([4, 3, 4, 3, 4]);
  });
});
