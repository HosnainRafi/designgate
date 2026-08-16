import { describe, expect, it } from "vitest";

describe("GitHub publishing credential", () => {
  it.skipIf(!process.env.GITHUB_TOKEN)("authenticates against the GitHub user endpoint when a publishing token is configured", async () => {
    const token = process.env.GITHUB_TOKEN!;
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    expect(response.status, "GitHub token authentication must succeed").toBe(200);
    const user = await response.json() as { login?: string; email?: string | null };
    expect(user.login).toBeTruthy();
  }, 20_000);
});
