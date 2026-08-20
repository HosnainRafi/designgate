# DesignGate Image-to-Code

`designgate image-to-code` converts a design screenshot into production-quality React component code using the project's configured vision provider (Anthropic or any OpenAI-compatible endpoint such as Mistral, MiniMax, OpenRouter, or z.ai). The generated code is automatically evaluated against DesignGate's deterministic Tier A rules and, when `--grade` is used, the rendered output is sent through the vision-based Tier B grader.

## Quick start

```bash
# Convert a screenshot into a React component, then render and verify it.
export ANTHROPIC_API_KEY="your-key"
npx designgate@latest image-to-code ./design.png --project . \
  --out ./generated/DesignFromImage.tsx --grade \
  --target http://localhost:3000
```

```bash
# Convert an image and run the verification loop until Tier A passes.
npx designgate@latest image-to-code ./design.png --project . \
  --out ./generated/DesignFromImage.tsx \
  --generator "npm run agent:fix" --target http://localhost:3000 --max-iterations 3
```

## How it works

1. **Context capture.** The command first runs the existing `context` flow so the Phase-0 project-context (detected tokens and reusable components) is available; the generated component is instructed to reuse them instead of inventing competing primitives.
2. **Vision conversion.** The screenshot is base64-encoded and sent to the configured vision model with a strict fidelity prompt: reproduce the exact layout, typography hierarchy, spacing scale, and color tokens; extract an explicit token system; stay responsive; respect `prefers-reduced-motion`; and never invent decorative assets or Lorem Ipsum copy that are not visible in the design.
3. **Write and render.** The generated code is written to `--out` and, when a `--target` is provided, the browser captures mobile, tablet, and desktop evidence at the target.
4. **Verify.** The project is checked against Tier A rules (extended with any enabled presets). With `--grade`, the three-breakpoint capture is sent to the Tier B vision grader for a full quality score.

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `--project <path>` | `.` | Project root containing `designgate.config.json` |
| `--out <path>` | `.designgate/generated/image-to-code/DesignFromImage.tsx` | Destination for the generated component |
| `--target <url-or-local-html>` | — | URL or local HTML to render after generation (required for `--grade`) |
| `--generator "command"` | — | Optional generator command that receives the generated code and runs the verification loop until Tier A passes |
| `--grade` | off | Run Tier B vision grading on the rendered evidence |
| `--model <model>` | `auto` | Override the configured grading model |
| `--provider <name>` | configured | Force `anthropic` or `openai-compatible` for this run |
| `--max-iterations <n>` | `1` | Maximum verification-loop iterations when `--generator` is set |

## Provider configuration

Image-to-code reuses the exact Tier B provider configuration in `designgate.config.json`, so a project already set up for `designgate check --grade` needs no additional setup. Anthropic is the default; `openai-compatible` accepts any endpoint exposing an `/v1/messages`-style chat completions interface. With no configured key, the command fails before making a request; it never silently skip the vision conversion.
