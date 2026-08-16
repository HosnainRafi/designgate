export const supportedProviders = ["anthropic", "openai-compatible"];

export function assertVisionConfig(config) {
  if (!config || typeof config !== "object") throw new Error("Tier B grading requires a provider configuration object.");
  if (!supportedProviders.includes(config.provider)) throw new Error(`Unsupported Tier B provider: ${config.provider}. Choose anthropic or openai-compatible.`);
  if (config.supportsVision === false) throw new Error(`Configured model ${config.model} does not support vision input. Choose a vision-capable model.`);
  if (!config.model) throw new Error("Tier B grading requires a vision model name.");
  if (!config.baseUrl) throw new Error(`Tier B grading provider ${config.provider} requires baseUrl.`);
  if (!config.apiKeyEnvVar) throw new Error(`Tier B grading provider ${config.provider} requires apiKeyEnvVar.`);
  const apiKey = process.env[config.apiKeyEnvVar];
  if (!apiKey) throw new Error(`Inline Tier B grading needs ${config.apiKeyEnvVar}. Set the configured provider key, then rerun with --grade. No screenshot data is uploaded when the key is absent.`);
  return apiKey;
}

export function result(provider, config, text) {
  return { provider, model: config.model, text };
}
