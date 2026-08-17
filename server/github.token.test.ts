import { describe, expect, it } from "vitest";

/** Retry wrapper: GitHub's API occasionally returns 5xx during partial
 *  outages; the publishing contract only requires eventual authentication. */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 5,
): Promise<Response> {
  let last: Response | undefined;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url, init);
    if (response.status < 500) {
      return response;
    }
    last = response;
    await new Promise((resolve) => setTimeout(resolve, 5_000 * (attempt + 1)));
  }
  return last as Response;
}

const headers = (token: string): Record<string, string> => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
});

describe("GitHub publishing credential", () => {
  it.skipIf(!process.env.GITHUB_TOKEN)(
    "authenticates against the GitHub user endpoint when a publishing token is configured",
    async () => {
      const token = process.env.GITHUB_TOKEN!;
      const response = await fetchWithRetry("https://api.github.com/user", {
        headers: headers(token),
      });
      expect(response.status, "GitHub token authentication must succeed").toBe(200);
      const user = await response.json() as { login?: string; email?: string | null };
      expect(user.login).toBeTruthy();
    },
    60_000,
  );

  it.skipIf(!process.env.GITHUB_TOKEN)(
    "reads the target repository permission contract",
    async () => {
      const token = process.env.GITHUB_TOKEN!;
      const response = await fetchWithRetry(
        "https://api.github.com/repos/HosnainRafi/AI-fine-grained",
        { headers: headers(token) },
      );
      expect([200, 404]).toContain(response.status);
    },
    60_000,
  );
});
