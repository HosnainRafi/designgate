import { request } from "node:https";

const owner = process.env.DESIGNGATE_GITHUB_OWNER ?? "HosnainRafi";
const repo = process.env.DESIGNGATE_GITHUB_REPO ?? "AI-fine-graded";
const branch = process.env.DESIGNGATE_GITHUB_BRANCH ?? "main";
const token = process.env.GITHUB_TOKEN;

if (!token) throw new Error("GITHUB_TOKEN is required.");

const body = JSON.stringify({
  required_status_checks: { strict: true, contexts: ["verify-ui"] },
  enforce_admins: true,
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    required_approving_review_count: 1,
  },
  restrictions: null,
  required_linear_history: true,
  allow_force_pushes: false,
  allow_deletions: false,
  block_creations: false,
  required_conversation_resolution: true,
});

const response = await new Promise((resolve, reject) => {
  const req = request({
    hostname: "api.github.com",
    path: `/repos/${owner}/${repo}/branches/${branch}/protection`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "designgate-release",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  }, (res) => {
    let data = "";
    res.setEncoding("utf8");
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => resolve({ status: res.statusCode ?? 0, data }));
  });
  req.on("error", reject);
  req.write(body);
  req.end();
});

if (response.status < 200 || response.status >= 300) {
  throw new Error(`GitHub branch protection failed (${response.status}): ${response.data}`);
}

console.log(`Protected ${owner}/${repo}:${branch}; required check: verify-ui`);
